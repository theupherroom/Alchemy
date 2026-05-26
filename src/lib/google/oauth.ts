import { createAdminClient } from "@/lib/supabase/admin";

export const GOOGLE_SCOPES = [
  "https://www.googleapis.com/auth/calendar.freebusy",
  "https://www.googleapis.com/auth/calendar.events",
];

const AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";

export function isOAuthConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_OAUTH_CLIENT_ID &&
      process.env.GOOGLE_OAUTH_CLIENT_SECRET &&
      process.env.GOOGLE_OAUTH_REDIRECT_URI,
  );
}

export function authorizeUrl(state: string): string | null {
  if (!isOAuthConfigured()) return null;
  const url = new URL(AUTH_ENDPOINT);
  url.searchParams.set("client_id", process.env.GOOGLE_OAUTH_CLIENT_ID!);
  url.searchParams.set("redirect_uri", process.env.GOOGLE_OAUTH_REDIRECT_URI!);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent");
  url.searchParams.set("scope", GOOGLE_SCOPES.join(" "));
  url.searchParams.set("state", state);
  return url.toString();
}

type TokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  scope?: string;
  token_type: string;
};

export async function exchangeCodeForTokens(code: string): Promise<TokenResponse> {
  const res = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_OAUTH_CLIENT_ID!,
      client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET!,
      redirect_uri: process.env.GOOGLE_OAUTH_REDIRECT_URI!,
      grant_type: "authorization_code",
    }),
  });
  if (!res.ok) {
    throw new Error(`token exchange failed: ${res.status} ${await res.text()}`);
  }
  return (await res.json()) as TokenResponse;
}

async function refreshAccessToken(refreshToken: string): Promise<TokenResponse> {
  const res = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: process.env.GOOGLE_OAUTH_CLIENT_ID!,
      client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET!,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) {
    throw new Error(`token refresh failed: ${res.status} ${await res.text()}`);
  }
  return (await res.json()) as TokenResponse;
}

// Returns a fresh bearer access token for the given user, refreshing if needed.
// Persists rotated tokens back to google_oauth_tokens.
export async function getAccessTokenForUser(userId: string): Promise<string | null> {
  if (!isOAuthConfigured()) return null;
  const admin = createAdminClient();

  const { data: tokens } = await admin
    .from("google_oauth_tokens")
    .select("access_token, refresh_token, expires_at")
    .eq("user_id", userId)
    .maybeSingle();

  if (!tokens) return null;

  const expiresAt = new Date(tokens.expires_at).getTime();
  const skewMs = 60_000; // refresh if expiring in under a minute
  if (expiresAt - skewMs > Date.now()) {
    return tokens.access_token;
  }

  const refreshed = await refreshAccessToken(tokens.refresh_token);
  const newExpiresAt = new Date(Date.now() + refreshed.expires_in * 1000).toISOString();
  await admin
    .from("google_oauth_tokens")
    .update({
      access_token: refreshed.access_token,
      expires_at: newExpiresAt,
    })
    .eq("user_id", userId);
  return refreshed.access_token;
}

export async function saveTokens(
  userId: string,
  tokens: TokenResponse,
): Promise<void> {
  if (!tokens.access_token || !tokens.refresh_token) {
    throw new Error(
      "Google did not return a refresh token — re-consent with prompt=consent.",
    );
  }
  const admin = createAdminClient();
  await admin.from("google_oauth_tokens").upsert({
    user_id: userId,
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
    scope: tokens.scope ?? GOOGLE_SCOPES.join(" "),
  });
  await admin
    .from("profiles")
    .update({ calendar_connected: true })
    .eq("id", userId);
}

export async function clearTokens(userId: string): Promise<void> {
  const admin = createAdminClient();
  await admin.from("google_oauth_tokens").delete().eq("user_id", userId);
  await admin
    .from("profiles")
    .update({ calendar_connected: false })
    .eq("id", userId);
}
