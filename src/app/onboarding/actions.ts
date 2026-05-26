"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateUniqueAlias } from "@/lib/alias/generate";
import type {
  ProfileGeoReach,
  ProfileOrgType,
  ProfilePartnershipType,
  ProfileSector,
  ProfileStage,
} from "@/types/database";

export type OnboardingFormState = {
  error?: string;
  field?: string;
};

const REQUIRED = [
  "mission_statement",
  "sector",
  "org_type",
  "stage",
  "what_we_offer",
  "what_we_need",
  "geographic_reach",
  "full_name",
  "org_name",
  "personal_email",
] as const;

const PARTNERSHIP_VALUES: ProfilePartnershipType[] = [
  "vendor",
  "co_program",
  "referral",
  "sponsorship",
  "advisory",
  "other",
];

export async function submitOnboardingAction(
  _prev: OnboardingFormState,
  formData: FormData,
): Promise<OnboardingFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Session expired. Sign in again." };
  }

  for (const key of REQUIRED) {
    const v = String(formData.get(key) ?? "").trim();
    if (!v) {
      return {
        error: `${key.replace(/_/g, " ")} is required.`,
        field: key,
      };
    }
  }

  const partnership_types = formData
    .getAll("partnership_types")
    .map((v) => String(v))
    .filter((v): v is ProfilePartnershipType =>
      PARTNERSHIP_VALUES.includes(v as ProfilePartnershipType),
    );

  if (partnership_types.length === 0) {
    return {
      error: "Pick at least one partnership type you're open to.",
      field: "partnership_types",
    };
  }

  const mission = String(formData.get("mission_statement") ?? "").trim();
  if (mission.length < 30) {
    return {
      error: "Mission statement needs at least 30 characters — tell us what you're working on.",
      field: "mission_statement",
    };
  }

  const admin = createAdminClient();
  let aliasInfo;
  try {
    aliasInfo = await generateUniqueAlias(admin);
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    return { error: `Could not generate an alias: ${message}` };
  }

  const timezone =
    String(formData.get("timezone") ?? "").trim() || "UTC";

  const upsert = {
    id: user.id,
    alias: aliasInfo.alias,
    alias_color: aliasInfo.color.toLowerCase(),
    alias_number: aliasInfo.number,
    mission_statement: mission,
    sector: formData.get("sector") as ProfileSector,
    org_type: formData.get("org_type") as ProfileOrgType,
    stage: formData.get("stage") as ProfileStage,
    partnership_types,
    what_we_offer: String(formData.get("what_we_offer") ?? "").trim(),
    what_we_need: String(formData.get("what_we_need") ?? "").trim(),
    geographic_reach: formData.get("geographic_reach") as ProfileGeoReach,
    region: String(formData.get("region") ?? "").trim() || null,
    impact_statement:
      String(formData.get("impact_statement") ?? "").trim() || null,
    timezone,
    full_name: String(formData.get("full_name") ?? "").trim(),
    org_name: String(formData.get("org_name") ?? "").trim(),
    personal_email: String(formData.get("personal_email") ?? "")
      .trim()
      .toLowerCase(),
    website: String(formData.get("website") ?? "").trim() || null,
    onboarded_at: new Date().toISOString(),
  };

  // Use admin client to insert because column grants restrict authenticated
  // SELECTs on the base table; INSERT through the authenticated client works,
  // but admin keeps the row write atomic with the alias check above.
  const { error } = await admin.from("profiles").upsert(upsert);

  if (error) {
    return { error: `Could not save profile: ${error.message}` };
  }

  redirect("/onboarding/welcome");
}
