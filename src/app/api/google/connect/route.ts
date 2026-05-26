import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { authorizeUrl } from "@/lib/google/oauth";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const url = authorizeUrl(user.id);
  if (!url) {
    return NextResponse.redirect(
      new URL("/settings/calendar?error=not_configured", request.url),
    );
  }
  return NextResponse.redirect(url);
}
