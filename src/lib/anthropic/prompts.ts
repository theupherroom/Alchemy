import {
  GEO_OPTIONS,
  ORG_TYPE_OPTIONS,
  PARTNERSHIP_TYPE_OPTIONS,
  SECTOR_OPTIONS,
  STAGE_OPTIONS,
  labelOf,
} from "@/lib/profile/enums";
import type { PublicProfileColumns } from "@/types/database";

export const SCORE_SYSTEM_PROMPT = `You are evaluating strategic partnership potential between two mission-driven organizations. Score 0-100 based on alignment of mission, sector, partnership types sought, complementarity of needs and offers, and geographic compatibility. Be honest — most pairs are not a strong match. Reserve 80+ for genuinely strong alignment. Return strict JSON only, no preamble.`;

export function buildScoreUserPrompt(
  a: PublicProfileColumns,
  b: PublicProfileColumns,
): string {
  return `Org A:
Mission: ${a.mission_statement}
Sector: ${labelOf(SECTOR_OPTIONS, a.sector)}
Org type: ${labelOf(ORG_TYPE_OPTIONS, a.org_type)}
Stage: ${labelOf(STAGE_OPTIONS, a.stage)}
Partnership types sought: ${a.partnership_types
    .map((t) => labelOf(PARTNERSHIP_TYPE_OPTIONS, t))
    .join(", ")}
What they offer: ${a.what_we_offer}
What they need: ${a.what_we_need}
Geographic reach: ${labelOf(GEO_OPTIONS, a.geographic_reach)}${a.region ? ` (${a.region})` : ""}

Org B:
Mission: ${b.mission_statement}
Sector: ${labelOf(SECTOR_OPTIONS, b.sector)}
Org type: ${labelOf(ORG_TYPE_OPTIONS, b.org_type)}
Stage: ${labelOf(STAGE_OPTIONS, b.stage)}
Partnership types sought: ${b.partnership_types
    .map((t) => labelOf(PARTNERSHIP_TYPE_OPTIONS, t))
    .join(", ")}
What they offer: ${b.what_we_offer}
What they need: ${b.what_we_need}
Geographic reach: ${labelOf(GEO_OPTIONS, b.geographic_reach)}${b.region ? ` (${b.region})` : ""}

Return JSON: { "score": <0-100 integer>, "rationale": "<2-3 sentences explaining the alignment or lack of it, written in the second person as if speaking to Org A. Cap at ~280 characters.>" }`;
}

export const INTRO_EMAIL_SYSTEM_PROMPT = `You write short, warm, mission-focused intro paragraphs for an anonymous strategic partnership platform. Tone: editorial, quietly confident, no exclamation points, no corporate jargon. The reader does not know the other party's identity yet — refer to them only by their alias. Return plain text, 60-110 words, no headers, no greeting, no signoff.`;

export function buildIntroEmailUserPrompt(args: {
  recipientAlias: string;
  otherAlias: string;
  ratiionaleFromScoring: string;
  otherMission: string;
  otherOffers: string;
  otherNeeds: string;
}): string {
  return `Write the body of an intro email for ${args.recipientAlias} about their match with ${args.otherAlias}.

Why we matched them (use this as the seed, expand into a warm paragraph): ${args.ratiionaleFromScoring}

About ${args.otherAlias}:
Mission: ${args.otherMission}
Offers: ${args.otherOffers}
Needs: ${args.otherNeeds}

Return one paragraph only. Speak directly to ${args.recipientAlias} in second person. Do not mention names, organizations, or websites — those stay hidden until the meeting.`;
}
