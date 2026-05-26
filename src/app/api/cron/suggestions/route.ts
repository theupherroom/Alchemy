import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { scoreProfiles } from "@/lib/anthropic/score";
import type { PublicProfileColumns } from "@/types/database";

// Vercel cron entry point. Configure in vercel.json:
//   { "crons": [{ "path": "/api/cron/suggestions", "schedule": "0 3 * * *" }] }
// Auth: Vercel sends `Authorization: Bearer <CRON_SECRET>` when CRON_SECRET is set.

const TOP_N = 5;
const MAX_CANDIDATES_PER_USER = 25; // upper bound on Claude calls per user per run
const MIN_SCORE_TO_KEEP = 50;

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "unauthorised" }, { status: 401 });
    }
  }

  const admin = createAdminClient();

  const { data: users, error: usersError } = await admin
    .from("profiles_public")
    .select("*")
    .order("created_at", { ascending: true });

  if (usersError) {
    return NextResponse.json({ error: usersError.message }, { status: 500 });
  }

  const all = (users ?? []) as PublicProfileColumns[];
  if (all.length < 2) {
    return NextResponse.json({ message: "Not enough users yet.", scored: 0 });
  }

  let scoredCount = 0;
  let insertedCount = 0;

  for (const me of all) {
    const { data: existing } = await admin
      .from("matches")
      .select("requester_id, recipient_id")
      .or(`requester_id.eq.${me.id},recipient_id.eq.${me.id}`);

    const excluded = new Set<string>([me.id]);
    for (const m of existing ?? []) {
      excluded.add(m.requester_id === me.id ? m.recipient_id : m.requester_id);
    }

    const candidates = all.filter((c) => {
      if (excluded.has(c.id)) return false;
      // Heuristic prefilter: sector match OR overlapping partnership type.
      if (c.sector === me.sector) return true;
      return c.partnership_types.some((t) => me.partnership_types.includes(t));
    });

    const trimmed = candidates.slice(0, MAX_CANDIDATES_PER_USER);
    const results: { candidate: string; score: number; rationale: string }[] = [];

    for (const candidate of trimmed) {
      const result = await scoreProfiles(me, candidate);
      scoredCount++;
      if (result.score !== null && result.score >= MIN_SCORE_TO_KEEP) {
        results.push({
          candidate: candidate.id,
          score: result.score,
          rationale: result.rationale,
        });
      }
    }

    results.sort((a, b) => b.score - a.score);
    const top = results.slice(0, TOP_N);

    if (top.length > 0) {
      const rows = top.map((r) => ({
        for_user: me.id,
        candidate: r.candidate,
        score: r.score,
        rationale: r.rationale,
        shown: false,
        dismissed: false,
      }));
      const { error: upsertError } = await admin
        .from("suggestions")
        .upsert(rows, { onConflict: "for_user,candidate" });
      if (!upsertError) insertedCount += top.length;
    }
  }

  return NextResponse.json({
    scored: scoredCount,
    upserted: insertedCount,
    users: all.length,
  });
}
