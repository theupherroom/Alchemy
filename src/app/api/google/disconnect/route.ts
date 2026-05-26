import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { clearTokens } from "@/lib/google/oauth";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  }
  await clearTokens(user.id);
  return NextResponse.redirect(new URL("/settings/calendar?disconnected=1", request.url), {
    status: 303,
  });
}
