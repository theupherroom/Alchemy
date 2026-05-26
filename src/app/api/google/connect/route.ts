import { NextResponse, type NextRequest } from "next/server";

// Stub — full OAuth flow lands in Phase 3b.
// If env is missing, redirect back to /settings/calendar with a config notice.

export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_OAUTH_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    const url = new URL("/settings/calendar", request.url);
    url.searchParams.set("error", "not_configured");
    return NextResponse.redirect(url);
  }

  const scope = [
    "https://www.googleapis.com/auth/calendar.freebusy",
    "https://www.googleapis.com/auth/calendar.events",
  ].join(" ");

  const auth = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  auth.searchParams.set("client_id", clientId);
  auth.searchParams.set("redirect_uri", redirectUri);
  auth.searchParams.set("response_type", "code");
  auth.searchParams.set("access_type", "offline");
  auth.searchParams.set("prompt", "consent");
  auth.searchParams.set("scope", scope);

  return NextResponse.redirect(auth);
}
