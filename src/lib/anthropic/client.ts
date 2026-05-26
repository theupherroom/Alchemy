import Anthropic from "@anthropic-ai/sdk";

// Singleton wrapper. Returns null if the env var is missing so callers can
// degrade gracefully (the app should still render without scoring).

let cached: Anthropic | null = null;

export function getAnthropicClient(): Anthropic | null {
  if (cached) return cached;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  cached = new Anthropic({ apiKey });
  return cached;
}

export const ANTHROPIC_MODEL = "claude-haiku-4-5-20251001";
