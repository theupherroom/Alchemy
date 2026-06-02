import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { scoreProfiles } from "@/lib/anthropic/score";
import { limitMatchRequests } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as {
    candidate?: string;
  } | null;
  const candidateId = body?.candidate;

  if (!candidateId || typeof candidateId !== "string") {
    return NextResponse.json({ error: "candidate required" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  }

  if (candidateId === user.id) {
    return NextResponse.json({ error: "You cannot request yourself." }, { status: 400 });
  }

  const admin = createAdminClient();

  // Approval gate — pending and rejected users cannot send requests.
  const { data: myProfile } = await admin
    .from("profiles")
    .select("approval_status")
    .eq("id", user.id)
    .maybeSingle();
  if (!myProfile || myProfile.approval_status !== "approved") {
    return NextResponse.json(
      {
        error:
          myProfile?.approval_status === "rejected"
            ? "Your profile is not approved."
            : "Your profile is still being reviewed. You can request matches once you're approved.",
      },
      { status: 403 },
    );
  }

  const limit = await limitMatchRequests(admin, user.id);
  if (!limit.allowed) {
    return NextResponse.json({ error: limit.reason }, { status: limit.status });
  }

  // Check for an existing match in either direction.
  const { data: existing } = await admin
    .from("matches")
    .select("id, status, requester_id, recipient_id")
    .or(
      `and(requester_id.eq.${user.id},recipient_id.eq.${candidateId}),and(requester_id.eq.${candidateId},recipient_id.eq.${user.id})`,
    )
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: "A match between you two already exists.", status: existing.status },
      { status: 409 },
    );
  }

  const [me, them] = await Promise.all([
    admin.from("profiles_public").select("*").eq("id", user.id).maybeSingle(),
    admin.from("profiles_public").select("*").eq("id", candidateId).maybeSingle(),
  ]);
  if (!me.data) {
    return NextResponse.json(
      { error: "Finish onboarding before sending requests." },
      { status: 409 },
    );
  }
  if (!them.data) {
    return NextResponse.json(
      { error: "Candidate not found or inactive." },
      { status: 404 },
    );
  }

  const scoring = await scoreProfiles(me.data, them.data);

  const { data: inserted, error: insertError } = await admin
    .from("matches")
    .insert({
      requester_id: user.id,
      recipient_id: candidateId,
      status: "pending",
      score: scoring.score,
      rationale: scoring.rationale,
    })
    .select("id")
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ id: inserted.id, status: "pending" });
}
