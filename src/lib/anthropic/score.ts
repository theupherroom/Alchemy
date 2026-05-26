import { createAdminClient } from "@/lib/supabase/admin";
import { ANTHROPIC_MODEL, getAnthropicClient } from "./client";
import { SCORE_SYSTEM_PROMPT, buildScoreUserPrompt } from "./prompts";
import type { PublicProfileColumns } from "@/types/database";

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

export type Scoring = {
  score: number | null;
  rationale: string;
  cached: boolean;
  reason?: "cache" | "computed" | "no_api_key" | "parse_error" | "api_error";
};

export async function scoreProfiles(
  a: PublicProfileColumns,
  b: PublicProfileColumns,
): Promise<Scoring> {
  // Canonical pair order — store one cache row per unordered pair.
  const [low, high] = a.id < b.id ? [a, b] : [b, a];
  const admin = createAdminClient();

  const { data: cached } = await admin
    .from("match_score_cache")
    .select("score, rationale, computed_at")
    .eq("user_a", low.id)
    .eq("user_b", high.id)
    .maybeSingle();

  if (
    cached &&
    Date.now() - new Date(cached.computed_at).getTime() < CACHE_TTL_MS
  ) {
    return {
      score: cached.score,
      rationale: cached.rationale,
      cached: true,
      reason: "cache",
    };
  }

  const client = getAnthropicClient();
  if (!client) {
    return {
      score: null,
      rationale: "AI scoring is not configured for this deployment.",
      cached: false,
      reason: "no_api_key",
    };
  }

  const t0 = Date.now();
  let response;
  try {
    response = await client.messages.create({
      model: ANTHROPIC_MODEL,
      max_tokens: 220,
      system: SCORE_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: buildScoreUserPrompt(a, b),
        },
      ],
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    await admin.from("ai_call_log").insert({
      feature: "score",
      model: ANTHROPIC_MODEL,
      latency_ms: Date.now() - t0,
      error: message,
    });
    return {
      score: null,
      rationale: "Scoring temporarily unavailable.",
      cached: false,
      reason: "api_error",
    };
  }

  const text = response.content
    .filter((b) => b.type === "text")
    .map((b) => (b.type === "text" ? b.text : ""))
    .join("");

  let parsed: { score?: number; rationale?: string };
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
  } catch {
    parsed = {};
  }

  const score =
    typeof parsed.score === "number" &&
    parsed.score >= 0 &&
    parsed.score <= 100
      ? Math.round(parsed.score)
      : null;
  const rationale =
    typeof parsed.rationale === "string" && parsed.rationale.trim().length > 0
      ? parsed.rationale.trim().slice(0, 320)
      : "";

  if (score === null || !rationale) {
    await admin.from("ai_call_log").insert({
      feature: "score",
      model: ANTHROPIC_MODEL,
      latency_ms: Date.now() - t0,
      input_tokens: response.usage.input_tokens,
      output_tokens: response.usage.output_tokens,
      error: `parse_error: ${text.slice(0, 200)}`,
    });
    return {
      score: null,
      rationale: "Scoring temporarily unavailable.",
      cached: false,
      reason: "parse_error",
    };
  }

  await admin.from("ai_call_log").insert({
    feature: "score",
    model: ANTHROPIC_MODEL,
    latency_ms: Date.now() - t0,
    input_tokens: response.usage.input_tokens,
    output_tokens: response.usage.output_tokens,
  });

  await admin.from("match_score_cache").upsert({
    user_a: low.id,
    user_b: high.id,
    score,
    rationale,
    computed_at: new Date().toISOString(),
  });

  return { score, rationale, cached: false, reason: "computed" };
}
