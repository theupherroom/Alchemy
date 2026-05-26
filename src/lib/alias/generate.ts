import type { SupabaseClient } from "@supabase/supabase-js";
import { ALIAS_COLORS, type AliasColor } from "./colors";

export type GeneratedAlias = {
  alias: string;
  color: AliasColor;
  number: number;
};

const MIN_NUMBER = 10;
const NUMBER_RANGE = 90; // 10..99 inclusive

export function generateRandomAlias(): GeneratedAlias {
  const color = ALIAS_COLORS[Math.floor(Math.random() * ALIAS_COLORS.length)];
  const number = MIN_NUMBER + Math.floor(Math.random() * NUMBER_RANGE);
  return {
    alias: `Partner ${color}-${number}`,
    color,
    number,
  };
}

// Requires a service-role Supabase client — RLS would hide other users' aliases
// from an authenticated-only client and break the uniqueness check.
export async function generateUniqueAlias(
  supabaseAdmin: SupabaseClient,
  maxAttempts = 50,
): Promise<GeneratedAlias> {
  for (let i = 0; i < maxAttempts; i++) {
    const candidate = generateRandomAlias();
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("alias", candidate.alias)
      .maybeSingle();

    if (error) throw error;
    if (!data) return candidate;
  }
  throw new Error(
    `alias generator exhausted after ${maxAttempts} attempts — the pool of ${ALIAS_COLORS.length * NUMBER_RANGE} aliases may be saturated`,
  );
}
