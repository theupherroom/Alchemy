import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { rescheduleMatch } from "@/lib/matching/reschedule";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: matchId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // Only participants of the match can reschedule it.
  const admin = createAdminClient();
  const { data: match } = await admin
    .from("matches")
    .select("requester_id, recipient_id, status")
    .eq("id", matchId)
    .maybeSingle();

  if (!match) {
    return NextResponse.json({ error: "match not found" }, { status: 404 });
  }
  if (match.requester_id !== user.id && match.recipient_id !== user.id) {
    return NextResponse.json(
      { error: "not a participant of this match" },
      { status: 403 },
    );
  }
  if (match.status !== "accepted") {
    return NextResponse.json(
      { error: `can't reschedule a ${match.status} match` },
      { status: 409 },
    );
  }

  const result = await rescheduleMatch(matchId, user.id);

  if (!result.success) {
    const status =
      result.reason === "calendar_not_connected" ||
      result.reason === "google_oauth_not_configured"
        ? 412
        : result.reason === "no_overlap"
          ? 409
          : result.reason === "reschedule_limit_reached"
            ? 429
            : 500;
    return NextResponse.json(
      { error: result.reason, message: result.message },
      { status },
    );
  }

  return NextResponse.json({
    starts_at: result.startsAt,
    ends_at: result.endsAt,
    meet_link: result.meetLink,
    reschedule_count: result.rescheduleCount,
    remaining_reschedules: result.remainingReschedules,
  });
}
