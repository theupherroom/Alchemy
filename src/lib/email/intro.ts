import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/admin";
import { ANTHROPIC_MODEL, getAnthropicClient } from "@/lib/anthropic/client";
import {
  INTRO_EMAIL_SYSTEM_PROMPT,
  buildIntroEmailUserPrompt,
} from "@/lib/anthropic/prompts";
import { renderIntroEmail } from "./templates/intro";
import {
  GEO_OPTIONS,
  SECTOR_OPTIONS,
  labelOf,
} from "@/lib/profile/enums";
import type { PublicProfileColumns } from "@/types/database";

const FROM_FALLBACK = "connect@alchemy.upherroom.com";

let resendClient: Resend | null = null;
function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!resendClient) resendClient = new Resend(process.env.RESEND_API_KEY);
  return resendClient;
}

export async function sendIntroEmails(matchId: string): Promise<{
  sent: number;
  errors: string[];
}> {
  const errors: string[] = [];
  const resend = getResend();
  if (!resend) {
    errors.push("RESEND_API_KEY is not configured.");
    return { sent: 0, errors };
  }

  const admin = createAdminClient();

  const { data: match } = await admin
    .from("matches")
    .select("requester_id, recipient_id, rationale, score")
    .eq("id", matchId)
    .maybeSingle();
  if (!match) {
    errors.push("match not found");
    return { sent: 0, errors };
  }

  const { data: meeting } = await admin
    .from("meetings")
    .select("starts_at, meet_link")
    .eq("match_id", matchId)
    .maybeSingle();
  if (!meeting) {
    errors.push("meeting not found");
    return { sent: 0, errors };
  }

  // Load both parties' full profiles via admin (need personal_email + visible cols).
  const [requesterRes, recipientRes] = await Promise.all([
    admin
      .from("profiles")
      .select("*")
      .eq("id", match.requester_id)
      .maybeSingle(),
    admin
      .from("profiles")
      .select("*")
      .eq("id", match.recipient_id)
      .maybeSingle(),
  ]);

  if (!requesterRes.data || !recipientRes.data) {
    errors.push("one or both profiles not found");
    return { sent: 0, errors };
  }

  const requester = requesterRes.data;
  const recipient = recipientRes.data;
  const fromAddress = process.env.RESEND_FROM_ADDRESS || FROM_FALLBACK;

  let sent = 0;

  for (const pair of [
    { to: requester, other: recipient },
    { to: recipient, other: requester },
  ]) {
    // Respect notification preferences. The recipient still has the meeting
    // on their calendar; we just skip the courtesy email when they've opted out.
    if (pair.to.notify_match_accepted === false) {
      continue;
    }
    try {
      const rationale = await refineRationale({
        recipientAlias: pair.to.alias,
        otherAlias: pair.other.alias,
        seedRationale: match.rationale ?? "",
        otherMission: pair.other.mission_statement,
        otherOffers: pair.other.what_we_offer,
        otherNeeds: pair.other.what_we_need,
      });

      const html = renderIntroEmail({
        recipientAlias: pair.to.alias,
        otherAlias: pair.other.alias,
        otherMission: pair.other.mission_statement,
        otherSector: labelOf(SECTOR_OPTIONS, pair.other.sector),
        otherReach: labelOf(GEO_OPTIONS, pair.other.geographic_reach),
        otherOffers: pair.other.what_we_offer,
        otherNeeds: pair.other.what_we_need,
        meetingTime: formatMeetingTime(meeting.starts_at, pair.to.timezone),
        meetLink: meeting.meet_link ?? "",
        rationale,
      });

      await resend.emails.send({
        from: `Alchemy <${fromAddress}>`,
        to: pair.to.personal_email,
        subject: "You have an Alchemy match — your intro meeting is confirmed.",
        html,
      });
      sent++;
    } catch (err) {
      errors.push(err instanceof Error ? err.message : "unknown");
    }
  }

  return { sent, errors };
}

async function refineRationale(args: {
  recipientAlias: string;
  otherAlias: string;
  seedRationale: string;
  otherMission: string;
  otherOffers: string;
  otherNeeds: string;
}): Promise<string> {
  const client = getAnthropicClient();
  if (!client) return args.seedRationale || "";

  const admin = createAdminClient();
  const t0 = Date.now();
  try {
    const res = await client.messages.create({
      model: ANTHROPIC_MODEL,
      max_tokens: 280,
      system: INTRO_EMAIL_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: buildIntroEmailUserPrompt({
            recipientAlias: args.recipientAlias,
            otherAlias: args.otherAlias,
            ratiionaleFromScoring: args.seedRationale,
            otherMission: args.otherMission,
            otherOffers: args.otherOffers,
            otherNeeds: args.otherNeeds,
          }),
        },
      ],
    });

    const text = res.content
      .filter((b) => b.type === "text")
      .map((b) => (b.type === "text" ? b.text : ""))
      .join("")
      .trim();

    await admin.from("ai_call_log").insert({
      feature: "intro_email",
      model: ANTHROPIC_MODEL,
      input_tokens: res.usage.input_tokens,
      output_tokens: res.usage.output_tokens,
      latency_ms: Date.now() - t0,
    });

    return text || args.seedRationale || "";
  } catch (err) {
    await admin.from("ai_call_log").insert({
      feature: "intro_email",
      model: ANTHROPIC_MODEL,
      latency_ms: Date.now() - t0,
      error: err instanceof Error ? err.message : "unknown",
    });
    return args.seedRationale || "";
  }
}

function formatMeetingTime(startsAt: string, timezone: string): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: timezone || "UTC",
      weekday: "long",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
    }).format(new Date(startsAt));
  } catch {
    return new Date(startsAt).toUTCString();
  }
}
