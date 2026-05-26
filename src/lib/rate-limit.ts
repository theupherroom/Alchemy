import type { SupabaseClient } from "@supabase/supabase-js";

// Lightweight Postgres-backed rate limits. No external store — we COUNT against
// the row that the action itself creates (matches, flags) within a time window.
// Good enough for a 50-user beta; swap in Vercel KV / Upstash for production.

export type RateLimitResult =
  | { allowed: true }
  | { allowed: false; reason: string; status: 429 };

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

export async function limitMatchRequests(
  admin: SupabaseClient,
  requesterId: string,
): Promise<RateLimitResult> {
  // Hourly cap: 5 new requests per hour
  const { count: recent } = await admin
    .from("matches")
    .select("id", { count: "exact", head: true })
    .eq("requester_id", requesterId)
    .gt("created_at", new Date(Date.now() - HOUR_MS).toISOString());

  if ((recent ?? 0) >= 5) {
    return {
      allowed: false,
      reason:
        "You've sent 5 requests in the last hour. Give the platform a moment to breathe.",
      status: 429,
    };
  }

  // Concurrent pending cap: 10 outstanding outgoing requests
  const { count: pending } = await admin
    .from("matches")
    .select("id", { count: "exact", head: true })
    .eq("requester_id", requesterId)
    .eq("status", "pending");

  if ((pending ?? 0) >= 10) {
    return {
      allowed: false,
      reason:
        "You have 10 pending requests already — wait for some to be answered before sending more.",
      status: 429,
    };
  }

  return { allowed: true };
}

export async function limitFlags(
  admin: SupabaseClient,
  reporterId: string,
): Promise<RateLimitResult> {
  const { count } = await admin
    .from("flags")
    .select("id", { count: "exact", head: true })
    .eq("reporter_id", reporterId)
    .gt("created_at", new Date(Date.now() - DAY_MS).toISOString());

  if ((count ?? 0) >= 5) {
    return {
      allowed: false,
      reason: "You've submitted 5 flags today. The cap resets in 24 hours.",
      status: 429,
    };
  }

  return { allowed: true };
}
