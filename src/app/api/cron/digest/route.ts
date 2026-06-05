import { NextResponse, type NextRequest } from "next/server";
import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/admin";
import { renderDigestEmail } from "@/lib/email/templates/digest";
import { GEO_OPTIONS, SECTOR_OPTIONS, labelOf } from "@/lib/profile/enums";
import type { PublicProfileColumns } from "@/types/database";

// Weekly cron — `0 14 * * 1` (Monday 14:00 UTC ≈ 9am ET).
// Configure in vercel.json. Auth via CRON_SECRET bearer.

const FROM_FALLBACK = "connect@alchemy.upherroom.com";
const TOP_N = 3;

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json(
      { error: "RESEND_API_KEY not configured" },
      { status: 500 },
    );
  }
  const resend = new Resend(process.env.RESEND_API_KEY);
  const fromAddress = process.env.RESEND_FROM_ADDRESS || FROM_FALLBACK;
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://alchemy.theupherroom.com";

  const admin = createAdminClient();

  const { data: users } = await admin
    .from("profiles")
    .select("id, alias, personal_email")
    .eq("status", "active")
    .eq("notify_weekly_digest", true)
    .not("onboarded_at", "is", null);

  let sent = 0;
  const errors: string[] = [];

  for (const user of users ?? []) {
    const { data: rows } = await admin
      .from("suggestions")
      .select("candidate, score, rationale")
      .eq("for_user", user.id)
      .eq("dismissed", false)
      .order("score", { ascending: false })
      .limit(TOP_N);

    if (!rows || rows.length === 0) continue;

    const candidateIds = rows.map((r) => r.candidate);
    const { data: profilesData } = await admin
      .from("profiles_public")
      .select("*")
      .in("id", candidateIds);
    const byId = new Map<string, PublicProfileColumns>(
      ((profilesData ?? []) as PublicProfileColumns[]).map((p) => [p.id, p]),
    );

    const suggestions = rows
      .map((r) => {
        const p = byId.get(r.candidate);
        return p
          ? {
              alias: p.alias,
              sector: labelOf(SECTOR_OPTIONS, p.sector),
              reach: labelOf(GEO_OPTIONS, p.geographic_reach),
              mission: p.mission_statement,
              score: r.score,
              rationale: r.rationale,
            }
          : null;
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);

    if (suggestions.length === 0) continue;

    try {
      await resend.emails.send({
        from: `Alchemy <${fromAddress}>`,
        to: user.personal_email,
        subject: `${user.alias}, three suggestions for this week`,
        html: renderDigestEmail({
          recipientAlias: user.alias,
          suggestions,
          appUrl,
        }),
      });
      sent++;
    } catch (err) {
      errors.push(err instanceof Error ? err.message : "unknown");
    }
  }

  return NextResponse.json({ sent, errors });
}
