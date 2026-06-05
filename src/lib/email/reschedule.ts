import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/admin";
import { renderRescheduleEmail } from "./templates/reschedule";

const FROM_FALLBACK = "connect@alchemy.theupherroom.com";

// Sends the "meeting moved" email to the OTHER party (not the initiator).
// No-ops gracefully if Resend isn't configured.
export async function sendRescheduleEmail(args: {
  matchId: string;
  initiatorId: string;
  newStartsAt: string;
  meetLink: string | null;
  remainingReschedules: number;
}): Promise<{ sent: boolean; error?: string }> {
  if (!process.env.RESEND_API_KEY) {
    return { sent: false, error: "RESEND_API_KEY not configured" };
  }

  const admin = createAdminClient();

  const { data: match } = await admin
    .from("matches")
    .select("requester_id, recipient_id")
    .eq("id", args.matchId)
    .maybeSingle();
  if (!match) return { sent: false, error: "match not found" };

  const otherId =
    match.requester_id === args.initiatorId
      ? match.recipient_id
      : match.requester_id;

  const [{ data: initiator }, { data: other }] = await Promise.all([
    admin
      .from("profiles")
      .select("alias")
      .eq("id", args.initiatorId)
      .maybeSingle(),
    admin
      .from("profiles")
      .select("alias, personal_email, timezone, notify_meeting_scheduled")
      .eq("id", otherId)
      .maybeSingle(),
  ]);

  if (!initiator || !other) {
    return { sent: false, error: "profile(s) not found" };
  }

  // Respect the recipient's notification preference. We reuse the
  // notify_meeting_scheduled toggle since this is the same conceptual event.
  if (other.notify_meeting_scheduled === false) {
    return { sent: false, error: "recipient opted out" };
  }

  const formattedTime = formatTime(args.newStartsAt, other.timezone);
  const resend = new Resend(process.env.RESEND_API_KEY);
  const fromAddress = process.env.RESEND_FROM_ADDRESS || FROM_FALLBACK;

  try {
    await resend.emails.send({
      from: `Alchemy <${fromAddress}>`,
      to: other.personal_email,
      subject: `${initiator.alias} rescheduled your alchemy meeting`,
      html: renderRescheduleEmail({
        recipientAlias: other.alias,
        initiatorAlias: initiator.alias,
        newMeetingTime: formattedTime,
        meetLink: args.meetLink ?? "",
        remaining: args.remainingReschedules,
      }),
    });
    return { sent: true };
  } catch (err) {
    return {
      sent: false,
      error: err instanceof Error ? err.message : "unknown",
    };
  }
}

function formatTime(iso: string, timezone: string | null | undefined): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: timezone || "UTC",
      weekday: "long",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
    }).format(new Date(iso));
  } catch {
    return new Date(iso).toUTCString();
  }
}
