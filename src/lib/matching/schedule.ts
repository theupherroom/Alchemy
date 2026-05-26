import { createAdminClient } from "@/lib/supabase/admin";
import {
  getAccessTokenForUser,
  isOAuthConfigured,
} from "@/lib/google/oauth";
import { createEvent, getBusy } from "@/lib/google/calendar";
import { findFirstOverlap } from "./overlap";

const HORIZONS_DAYS = [10, 14];

export type ScheduleResult =
  | { success: true; meetingId: string; startsAt: string; meetLink: string | null }
  | {
      success: false;
      reason:
        | "google_oauth_not_configured"
        | "calendar_not_connected"
        | "no_overlap"
        | "google_api_error"
        | "match_not_found"
        | "already_scheduled";
      message?: string;
    };

export async function scheduleMatch(matchId: string): Promise<ScheduleResult> {
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

  const { data: existing } = await admin
    .from("meetings")
    .select("id, starts_at, meet_link")
    .eq("match_id", matchId)
    .maybeSingle();
  if (existing) {
    return {
      success: true,
      meetingId: existing.id,
      startsAt: existing.starts_at,
      meetLink: existing.meet_link,
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
    .select("timezone, alias")
    .eq("id", match.recipient_id)
    .maybeSingle();
  const { data: requesterProfile } = await admin
    .from("profiles")
    .select("alias")
    .eq("id", match.requester_id)
    .maybeSingle();

  const recipientTimezone = recipientProfile?.timezone ?? "UTC";
  const aliasRequester = requesterProfile?.alias ?? "Partner";
  const aliasRecipient = recipientProfile?.alias ?? "Partner";

  let overlap: { startIso: string; endIso: string } | null = null;
  for (const horizon of HORIZONS_DAYS) {
    const from = new Date();
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

  const summary = `Alchemy Intro — ${aliasRequester} & ${aliasRecipient}`;

  let requesterEventId: string;
  let recipientEventId: string;
  let meetLink: string | null = null;

  try {
    const requesterEvent = await createEvent(requesterToken, {
      summary,
      description: buildEventDescription(aliasRecipient),
      startIso: overlap.startIso,
      endIso: overlap.endIso,
      generateMeet: true,
    });
    requesterEventId = requesterEvent.id;
    meetLink = requesterEvent.meetLink;

    const recipientEvent = await createEvent(
      recipientToken,
      {
        summary,
        description: buildEventDescription(aliasRequester),
        startIso: overlap.startIso,
        endIso: overlap.endIso,
        generateMeet: false,
      },
      meetLink ?? undefined,
    );
    recipientEventId = recipientEvent.id;
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    return { success: false, reason: "google_api_error", message };
  }

  const { data: inserted, error: insertError } = await admin
    .from("meetings")
    .insert({
      match_id: matchId,
      google_event_id_requester: requesterEventId,
      google_event_id_recipient: recipientEventId,
      meet_link: meetLink,
      starts_at: overlap.startIso,
      ends_at: overlap.endIso,
    })
    .select("id")
    .single();

  if (insertError) {
    return {
      success: false,
      reason: "google_api_error",
      message: insertError.message,
    };
  }

  return {
    success: true,
    meetingId: inserted.id,
    startsAt: overlap.startIso,
    meetLink,
  };
}

function buildEventDescription(otherAlias: string): string {
  return [
    "You have an Alchemy match. Your intro meeting is confirmed.",
    "",
    `Match: ${otherAlias}`,
    "",
    "Identity is revealed at the meeting. Show up curious.",
    "",
    "— Alchemy, a tool of The UpHer Room",
  ].join("\n");
}
