import type {
  ProfileGeoReach,
  ProfilePartnershipType,
  ProfileSector,
  ProfileStage,
  PublicProfileColumns,
} from "@/types/database";

// Heuristic dimensional compatibility. Pairs a 0-100 score per axis next to
// the AI's overall match score so users can see what's driving the fit.
// All math is pure, deterministic, and runs in O(profile content length).

export type CompatibilityAxis = {
  key: "sector" | "partnership" | "mission" | "geographic" | "stage";
  label: string;
  score: number;
  detail: string;
};

const SECTOR_ADJACENCY: Record<ProfileSector, ProfileSector[]> = {
  health: ["nonprofit", "social_impact"],
  education: ["nonprofit", "social_impact", "arts"],
  tech: ["finance", "other"],
  nonprofit: ["health", "education", "social_impact", "arts"],
  retail: ["finance", "other"],
  social_impact: ["health", "education", "nonprofit", "arts"],
  finance: ["tech", "retail"],
  arts: ["education", "nonprofit", "social_impact"],
  other: ["tech", "retail"],
};

const STAGE_ORDER: Record<ProfileStage, number> = {
  solo: 0,
  early_1_5: 1,
  growth_6_20: 2,
  established_20_plus: 3,
};

const GEO_ORDER: Record<ProfileGeoReach, number> = {
  local: 0,
  regional: 1,
  national: 2,
  international: 3,
};

const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "but", "of", "to", "in", "on", "for", "with",
  "by", "from", "as", "is", "are", "was", "were", "be", "been", "being",
  "we", "our", "us", "they", "them", "their", "you", "your", "i", "my",
  "this", "that", "these", "those", "who", "which", "what", "where",
  "have", "has", "had", "do", "does", "did", "will", "would", "should",
  "at", "it", "its", "if", "than", "then", "so", "not", "no", "all",
  "help", "make", "build", "work", "people", "team",
]);

function tokens(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^\p{L}\p{N}\s]/gu, " ")
      .split(/\s+/)
      .filter((w) => w.length >= 3 && !STOPWORDS.has(w)),
  );
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let intersection = 0;
  for (const tok of a) if (b.has(tok)) intersection++;
  const union = a.size + b.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

function sectorAxis(
  a: ProfileSector,
  b: ProfileSector,
): { score: number; detail: string } {
  if (a === b) return { score: 100, detail: "Same sector" };
  if (SECTOR_ADJACENCY[a]?.includes(b)) {
    return { score: 75, detail: "Adjacent sectors" };
  }
  return { score: 40, detail: "Different sectors" };
}

function partnershipAxis(
  a: ProfilePartnershipType[],
  b: ProfilePartnershipType[],
): { score: number; detail: string } {
  if (a.length === 0 || b.length === 0) {
    return { score: 0, detail: "No partnership types declared" };
  }
  const aSet = new Set(a);
  const overlap = b.filter((t) => aSet.has(t));
  const denom = Math.min(a.length, b.length);
  const score = Math.round((overlap.length / denom) * 100);
  return {
    score,
    detail:
      overlap.length === 0
        ? "No common partnership types"
        : `${overlap.length} shared partnership type${overlap.length === 1 ? "" : "s"}`,
  };
}

function geographicAxis(
  a: ProfileGeoReach,
  b: ProfileGeoReach,
): { score: number; detail: string } {
  if (a === b) return { score: 100, detail: "Same reach" };
  const diff = Math.abs(GEO_ORDER[a] - GEO_ORDER[b]);
  if (diff === 1) return { score: 75, detail: "Adjacent reach" };
  if (diff === 2) return { score: 55, detail: "Distant reach" };
  return { score: 35, detail: "Very different reach" };
}

function stageAxis(
  a: ProfileStage,
  b: ProfileStage,
): { score: number; detail: string } {
  if (a === b) return { score: 100, detail: "Same stage" };
  const diff = Math.abs(STAGE_ORDER[a] - STAGE_ORDER[b]);
  if (diff === 1) return { score: 85, detail: "Adjacent stages" };
  return { score: 65, detail: "Cross-stage — often valuable" };
}

function missionAxis(
  a: PublicProfileColumns,
  b: PublicProfileColumns,
): { score: number; detail: string } {
  const textA = `${a.mission_statement} ${a.what_we_offer} ${a.what_we_need}`;
  const textB = `${b.mission_statement} ${b.what_we_offer} ${b.what_we_need}`;
  const similarity = jaccard(tokens(textA), tokens(textB));
  const score = Math.round(similarity * 100 * 2.2); // bias upward — Jaccard is harsh
  const capped = Math.min(100, score);
  return {
    score: capped,
    detail:
      capped >= 70
        ? "Strong keyword overlap"
        : capped >= 40
          ? "Moderate overlap"
          : "Few shared keywords",
  };
}

export function computeCompatibility(
  a: PublicProfileColumns,
  b: PublicProfileColumns,
): CompatibilityAxis[] {
  return [
    { key: "sector", label: "Sector alignment", ...sectorAxis(a.sector, b.sector) },
    {
      key: "partnership",
      label: "Partnership fit",
      ...partnershipAxis(a.partnership_types, b.partnership_types),
    },
    {
      key: "mission",
      label: "Mission resonance",
      ...missionAxis(a, b),
    },
    {
      key: "geographic",
      label: "Geographic reach",
      ...geographicAxis(a.geographic_reach, b.geographic_reach),
    },
    {
      key: "stage",
      label: "Stage compatibility",
      ...stageAxis(a.stage, b.stage),
    },
  ];
}
