import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { scoreProfiles } from "@/lib/anthropic/score";

// GET /api/score?candidate=<uuid>
// Returns { score: number | null, rationale: string } for the authenticated
// user against the candidate. Uses match_score_cache (24h TTL).

export async function GET(request: NextRequest) {
  const candidateId = request.nextUrl.searchParams.get("candidate");
  if (!candidateId) {
    return NextResponse.json({ error: "candidate required" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (candidateId === user.id) {
    return NextResponse.json({ score: null, rationale: "" });
  }

  const admin = createAdminClient();

  const [me, them] = await Promise.all([
    admin.from("profiles_public").select("*").eq("id", user.id).maybeSingle(),
    admin
      .from("profiles_public")
      .select("*")
      .eq("id", candidateId)
      .maybeSingle(),
  ]);

  if (me.error || !me.data) {
    return NextResponse.json(
      { error: "Your profile is not visible yet — finish onboarding." },
      { status: 409 },
    );
  }
  if (them.error || !them.data) {
    return NextResponse.json(
      { error: "Candidate not found or inactive." },
      { status: 404 },
    );
  }

  const result = await scoreProfiles(me.data, them.data);
  return NextResponse.json({
    score: result.score,
    rationale: result.rationale,
  });
}
