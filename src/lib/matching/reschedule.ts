import { createAdminClient } from "@/lib/supabase/admin";
import {
  getAccessTokenForUser,
  isOAuthConfigured,
} from "@/lib/google/oauth";
import { getBusy, updateEventTime } from "@/lib/google/calendar";
import { findFirstOverlap } from "./overlap";
import { sendRescheduleEmail } from "@/lib/email/reschedule";

// Rescheduling strategy:
//   1. Check the reschedule cap (RESCHEDULE_LIMIT). Reject early if reached.
//   2. Keep the OLD events on both calendars while we search. That way the
//      free/busy query naturally excludes the current slot — the new slot
//      is guaranteed to be different.
//   3. Run findFirstOverlap fresh with a 14-day horizon (then 21-day).
//   4. PATCH both events' start/end to the new slot. The event id, meet
//      link, and conferenceData all stay stable across reschedules.
//   5. Update the meetings row, increment reschedule_count.
//   6. Fire a reschedule email to the OTHER party (best-effort).

const HORIZONS_DAYS = [14, 21];
export const RESCHEDULE_LIMIT = 2;

export type RescheduleResult =
  | {
      success: true;
      startsAt: string;
      endsAt: string;
      meetLink: string | null;
      rescheduleCount: number;
      remainingReschedules: number;
    }
  | {
      success: false;
      reason:
        | "google_oauth_not_configured"
        | "calendar_not_connected"
        | "no_overlap"
        | "google_api_error"
        | "match_not_found"
        | "meeting_not_found"
        | "missing_event_ids"
        | "reschedule_limit_reached";
      message?: string;
    };

export async function rescheduleMatch(
  matchId: string,
  initiatorId: string,
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
    return {
      success: false,
      reason: "match_not_found",
      message: `match status is ${match.status}`,
    };
  }

  const { data: meeting } = await admin
    .from("meetings")
    .select(
      "id, starts_at, ends_at, meet_link, google_event_id_requester, google_event_id_recipient, reschedule_count",
    )
    .eq("match_id", matchId)
    .maybeSingle();
  if (!meeting) return { success: false, reason: "meeting_not_found" };
  if (!meeting.google_event_id_requester || !meeting.google_event_id_recipient) {
    return { success: false, reason: "missing_event_ids" };
  }

  const currentCount = meeting.reschedule_count ?? 0;
  if (currentCount >= RESCHEDULE_LIMIT) {
    return {
      success: false,
      reason: "reschedule_limit_reached",
      message: `This meeting has already been rescheduled ${currentCount} time${currentCount === 1 ? "" : "s"}. No more reschedules allowed.`,
    };
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
    // Search from now + 1 hour to avoid landing on something imminent.
    // The old slot is on both calendars and will show as busy, so
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

  // Patch both events. If either fails, abort and surface the error —
  // best-effort retry of partial reschedule isn't worth the complexity here.
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

  const newCount = currentCount + 1;
  const { error: updateError } = await admin
    .from("meetings")
    .update({
      starts_at: overlap.startIso,
      ends_at: overlap.endIso,
      reschedule_count: newCount,
    })
    .eq("id", meeting.id);

  if (updateError) {
    return {
      success: false,
      reason: "google_api_error",
      message: `events patched but DB update failed: ${updateError.message}`,
    };
  }

  const remainingReschedules = RESCHEDULE_LIMIT - newCount;

  // Notify the other party. Non-blocking — never fail the reschedule on
  // email error; just log via the returned object.
  void sendRescheduleEmail({
    matchId,
    initiatorId,
    newStartsAt: overlap.startIso,
    meetLink: meeting.meet_link,
    remainingReschedules,
  }).catch(() => {
    // swallowed — the reschedule itself succeeded
  });

  return {
    success: true,
    startsAt: overlap.startIso,
    endsAt: overlap.endIso,
    meetLink: meeting.meet_link,
    rescheduleCount: newCount,
    remainingReschedules,
  };
}
