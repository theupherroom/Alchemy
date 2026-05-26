// 40 curated colors for Alchemy aliases.
// Rules from prompt.md §4:
//   - Warm, non-gendered, non-clinical
//   - No "Pink", "Rose", or anything that hints at gender
//   - Real color names that read as identifiers, not placeholders

export const ALIAS_COLORS = [
  "Violet",
  "Ember",
  "Saffron",
  "Cobalt",
  "Indigo",
  "Moss",
  "Clay",
  "Sienna",
  "Pearl",
  "Ash",
  "Slate",
  "Amber",
  "Cedar",
  "Onyx",
  "Cerulean",
  "Garnet",
  "Marigold",
  "Olive",
  "Obsidian",
  "Bronze",
  "Citrine",
  "Cinder",
  "Driftwood",
  "Fern",
  "Flint",
  "Glacier",
  "Harvest",
  "Ivy",
  "Juniper",
  "Lichen",
  "Mahogany",
  "Maple",
  "Mist",
  "Mulberry",
  "Mustard",
  "Nimbus",
  "Tundra",
  "Quartz",
  "Topaz",
  "Umber",
] as const;

export type AliasColor = (typeof ALIAS_COLORS)[number];
