import type {
  ProfileGeoReach,
  ProfileOrgType,
  ProfilePartnershipType,
  ProfileSector,
  ProfileStage,
} from "@/types/database";

export const SECTOR_OPTIONS: { value: ProfileSector; label: string }[] = [
  { value: "health", label: "Health" },
  { value: "education", label: "Education" },
  { value: "tech", label: "Technology" },
  { value: "nonprofit", label: "Nonprofit" },
  { value: "retail", label: "Retail" },
  { value: "social_impact", label: "Social impact" },
  { value: "finance", label: "Finance" },
  { value: "arts", label: "Arts & culture" },
  { value: "other", label: "Other" },
];

export const ORG_TYPE_OPTIONS: { value: ProfileOrgType; label: string }[] = [
  { value: "for_profit", label: "For-profit" },
  { value: "nonprofit", label: "Nonprofit" },
  { value: "social_enterprise", label: "Social enterprise" },
  { value: "cooperative", label: "Cooperative" },
  { value: "llc", label: "LLC" },
  { value: "other", label: "Other" },
];

export const STAGE_OPTIONS: { value: ProfileStage; label: string }[] = [
  { value: "solo", label: "Solo founder" },
  { value: "early_1_5", label: "Early — 1 to 5 people" },
  { value: "growth_6_20", label: "Growth — 6 to 20 people" },
  { value: "established_20_plus", label: "Established — 20+" },
];

export const PARTNERSHIP_TYPE_OPTIONS: {
  value: ProfilePartnershipType;
  label: string;
  description: string;
}[] = [
  {
    value: "vendor",
    label: "Vendor",
    description: "Procurement and supply relationships",
  },
  {
    value: "co_program",
    label: "Co-program",
    description: "Joint initiatives or co-designed offerings",
  },
  {
    value: "referral",
    label: "Referral",
    description: "Cross-introductions to customers or partners",
  },
  {
    value: "sponsorship",
    label: "Sponsorship",
    description: "Funding, in-kind support, or visibility",
  },
  {
    value: "advisory",
    label: "Advisory",
    description: "Strategic counsel, mentorship, or board roles",
  },
  {
    value: "other",
    label: "Other",
    description: "Something else — tell them when you connect",
  },
];

export const GEO_OPTIONS: { value: ProfileGeoReach; label: string }[] = [
  { value: "local", label: "Local (one city or metro)" },
  { value: "regional", label: "Regional (multi-city or state)" },
  { value: "national", label: "National" },
  { value: "international", label: "International" },
];

export function labelOf<V extends string>(
  options: { value: V; label: string }[],
  value: V | null | undefined,
): string {
  if (!value) return "";
  return options.find((o) => o.value === value)?.label ?? value;
}
