import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  exchangeCodeForTokens,
  isOAuthConfigured,
  saveTokens,
} from "@/lib/google/oauth";

export async function GET(request: NextRequest) {
  if (!isOAuthConfigured()) {
    return NextResponse.redirect(
      new URL("/settings/calendar?error=not_configured", request.url),
    );
  }

  const code = request.nextUrl.searchParams.get("code");
  const error = request.nextUrl.searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(
      new URL(
        `/settings/calendar?error=${encodeURIComponent(error ?? "missing_code")}`,
        request.url,
      ),
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    await saveTokens(user.id, tokens);
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    return NextResponse.redirect(
      new URL(
        `/settings/calendar?error=${encodeURIComponent(message)}`,
        request.url,
      ),
    );
  }

  return NextResponse.redirect(
    new URL("/settings/calendar?connected=1", request.url),
  );
}
