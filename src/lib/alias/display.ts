// Render-time alias formatter.
// Aliases look like "Partner Violet-42". On narrow screens browsers happily
// line-break at the ASCII hyphen, producing "Violet-" / "42" — which reads as
// a typo. Swapping U+002D for U+2011 (NON-BREAKING HYPHEN) keeps the codename
// glued together while still allowing the natural break at the space between
// "Partner" and the codename.

const NB_HYPHEN = "‑";

export function formatAlias(alias: string): string {
  return alias.replace(/-/g, NB_HYPHEN);
}
