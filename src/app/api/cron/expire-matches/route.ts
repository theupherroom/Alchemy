import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Daily cron — `0 4 * * *`. Marks pending matches older than 14 days as expired
// so they stop counting against the requester's outgoing-pending cap and
// disappear from "Awaiting reply" UIs.

const EXPIRY_DAYS = 14;

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const cutoff = new Date(Date.now() - EXPIRY_DAYS * 86_400_000).toISOString();
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("matches")
    .update({ status: "expired", responded_at: new Date().toISOString() })
    .eq("status", "pending")
    .lt("created_at", cutoff)
    .select("id");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ expired: data?.length ?? 0 });
}
