import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { limitFlags } from "@/lib/rate-limit";

// POST /api/flags
// body: { reported: string, reason?: string }
// Schema trigger handle_new_flag() takes care of incrementing flag_count and
// auto-suspending at 3 strikes.

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as {
    reported?: string;
    reason?: string;
  } | null;

  const reportedId = body?.reported;
  const reason = body?.reason?.slice(0, 1000) ?? null;

  if (!reportedId || typeof reportedId !== "string") {
    return NextResponse.json({ error: "reported required" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  }

  if (reportedId === user.id) {
    return NextResponse.json(
      { error: "You cannot flag yourself." },
      { status: 400 },
    );
  }

  const admin = createAdminClient();

  const limit = await limitFlags(admin, user.id);
  if (!limit.allowed) {
    return NextResponse.json({ error: limit.reason }, { status: limit.status });
  }

  // Prevent duplicate flags from the same reporter against the same person.
  const { data: existing } = await admin
    .from("flags")
    .select("id")
    .eq("reporter_id", user.id)
    .eq("reported_id", reportedId)
    .maybeSingle();
  if (existing) {
    return NextResponse.json(
      { error: "You have already flagged this profile." },
      { status: 409 },
    );
  }

  const { error } = await admin.from("flags").insert({
    reporter_id: user.id,
    reported_id: reportedId,
    reason,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
