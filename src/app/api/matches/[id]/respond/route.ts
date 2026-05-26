import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { scheduleMatch } from "@/lib/matching/schedule";
import { sendIntroEmails } from "@/lib/email/intro";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: matchId } = await params;
  const body = (await request.json().catch(() => null)) as {
    action?: "accept" | "decline";
  } | null;
  const action = body?.action;

  if (action !== "accept" && action !== "decline") {
    return NextResponse.json({ error: "invalid action" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  }

  const admin = createAdminClient();

  const { data: match } = await admin
    .from("matches")
    .select("id, requester_id, recipient_id, status")
    .eq("id", matchId)
    .maybeSingle();

  if (!match) {
    return NextResponse.json({ error: "match not found" }, { status: 404 });
  }
  if (match.recipient_id !== user.id) {
    return NextResponse.json(
      { error: "only the recipient can respond" },
      { status: 403 },
    );
  }
  if (match.status !== "pending") {
    return NextResponse.json(
      { error: `already ${match.status}` },
      { status: 409 },
    );
  }

  const nextStatus = action === "accept" ? "accepted" : "declined";
  const { error: updateError } = await admin
    .from("matches")
    .update({
      status: nextStatus,
      responded_at: new Date().toISOString(),
    })
    .eq("id", matchId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  if (nextStatus === "accepted") {
    // Fire-and-do-not-block: scheduling + emails happen synchronously here,
    // but failures don't undo the accept (we still want the match alive).
    try {
      const scheduled = await scheduleMatch(matchId);
      if (scheduled.success) {
        await sendIntroEmails(matchId).catch(() => {
          // Email failure shouldn't 500 the response — already logged inside.
        });
      }
      return NextResponse.json({
        status: nextStatus,
        scheduling: scheduled,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "unknown";
      return NextResponse.json({
        status: nextStatus,
        scheduling: { success: false, reason: "exception", message },
      });
    }
  }

  return NextResponse.json({ status: nextStatus });
}
