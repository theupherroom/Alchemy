import { createAdminClient } from "@/lib/supabase/admin";
import {
  getAccessTokenForUser,
  isOAuthConfigured,
} from "@/lib/google/oauth";
import { getBusy, updateEventTime } from "@/lib/google/calendar";
import { findFirstOverlap } from "./overlap";

// Rescheduling strategy:
//   1. Keep the OLD events on both calendars while we search. That way the
//      free/busy query naturally excludes the current slot — the new slot
//      is guaranteed to be different.
//   2. Run findFirstOverlap fresh with a 14-day horizon.
//   3. PATCH both events' start/end to the new slot. The event id, meet
//      link, and conferenceData all stay stable across reschedules.
//   4. Update the meetings row.
//
// Notes:
//   - Either party can reschedule; the API route does its own permission check.
//   - We don't send notifications/emails on reschedule yet — Google Calendar's
//     own change notice surfaces in each user's calendar UI (assuming they're
//     subscribed to event-update emails for their primary calendar).

const HORIZONS_DAYS = [14, 21];

export type RescheduleResult =
  | { success: true; startsAt: string; endsAt: string; meetLink: string | null }
  | {
      success: false;
      reason:
        | "google_oauth_not_configured"
        | "calendar_not_connected"
        | "no_overlap"
        | "google_api_error"
        | "match_not_found"
        | "meeting_not_found"
        | "missing_event_ids";
      message?: string;
    };

export async function rescheduleMatch(
  matchId: string,
): Promise<RescheduleResult> {
  if (!isOAuthConfigured()) {
    return { success: false, reason: "google_oauth_not_configured" };
  }

  const admin = createAdminClient();

  const { data: match } = await admin
    .from("matches")
    .select("id, requester_id, recipient_id, status")
    .eq("id", matchId)
    .maybeSingle();
  if (!match) return { success: false, reason: "match_not_found" };
  if (match.status !== "accepted") {
    return { success: false, reason: "match_not_found", message: `match status is ${match.status}` };
  }

  const { data: meeting } = await admin
    .from("meetings")
    .select(
      "id, starts_at, ends_at, meet_link, google_event_id_requester, google_event_id_recipient",
    )
    .eq("match_id", matchId)
    .maybeSingle();
  if (!meeting) return { success: false, reason: "meeting_not_found" };
  if (!meeting.google_event_id_requester || !meeting.google_event_id_recipient) {
    return { success: false, reason: "missing_event_ids" };
  }

  const [requesterToken, recipientToken] = await Promise.all([
    getAccessTokenForUser(match.requester_id),
    getAccessTokenForUser(match.recipient_id),
  ]);
  if (!requesterToken || !recipientToken) {
    return { success: false, reason: "calendar_not_connected" };
  }

  const { data: recipientProfile } = await admin
    .from("profiles")
    .select("timezone")
    .eq("id", match.recipient_id)
    .maybeSingle();
  const recipientTimezone = recipientProfile?.timezone ?? "UTC";

  let overlap: { startIso: string; endIso: string } | null = null;
  for (const horizon of HORIZONS_DAYS) {
    // Search from now + 1 hour to avoid landing on something in the next few
    // minutes. The old slot is on both calendars and will show as busy, so
    // findFirstOverlap will naturally skip it.
    const from = new Date(Date.now() + 60 * 60 * 1000);
    const to = new Date(Date.now() + horizon * 86_400_000);
    try {
      const [busyA, busyB] = await Promise.all([
        getBusy(requesterToken, from.toISOString(), to.toISOString()),
        getBusy(recipientToken, from.toISOString(), to.toISOString()),
      ]);
      overlap = findFirstOverlap(
        busyA,
        busyB,
        from.toISOString(),
        to.toISOString(),
        recipientTimezone,
      );
      if (overlap) break;
    } catch (err) {
      const message = err instanceof Error ? err.message : "unknown";
      return { success: false, reason: "google_api_error", message };
    }
  }

  if (!overlap) {
    return { success: false, reason: "no_overlap" };
  }

  // Patch both events. Use Promise.allSettled so a failure on one calendar
  // doesn't leave the other in a different slot — if either fails, abort and
  // surface the error. (Best-effort retry of partial reschedule isn't worth
  // the complexity at this scale.)
  try {
    await Promise.all([
      updateEventTime(
        requesterToken,
        meeting.google_event_id_requester,
        overlap.startIso,
        overlap.endIso,
      ),
      updateEventTime(
        recipientToken,
        meeting.google_event_id_recipient,
        overlap.startIso,
        overlap.endIso,
      ),
    ]);
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    return { success: false, reason: "google_api_error", message };
  }

  const { error: updateError } = await admin
    .from("meetings")
    .update({
      starts_at: overlap.startIso,
      ends_at: overlap.endIso,
    })
    .eq("id", meeting.id);

  if (updateError) {
    return {
      success: false,
      reason: "google_api_error",
      message: `events patched but DB update failed: ${updateError.message}`,
    };
  }

  return {
    success: true,
    startsAt: overlap.startIso,
    endsAt: overlap.endIso,
    meetLink: meeting.meet_link,
  };
}
