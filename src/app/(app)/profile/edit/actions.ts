"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  ProfileGeoReach,
  ProfileOrgType,
  ProfilePartnershipType,
  ProfileSector,
  ProfileStage,
} from "@/types/database";

export type EditProfileFormState = {
  error?: string;
  saved?: boolean;
};

const PARTNERSHIP_VALUES: ProfilePartnershipType[] = [
  "vendor",
  "co_program",
  "referral",
  "sponsorship",
  "advisory",
  "other",
];

export async function updateProfileAction(
  _prev: EditProfileFormState,
  formData: FormData,
): Promise<EditProfileFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Session expired. Sign in again." };

  const mission = String(formData.get("mission_statement") ?? "").trim();
  if (mission.length < 30) {
    return { error: "Mission needs at least 30 characters." };
  }

  const partnership_types = formData
    .getAll("partnership_types")
    .map((v) => String(v))
    .filter((v): v is ProfilePartnershipType =>
      PARTNERSHIP_VALUES.includes(v as ProfilePartnershipType),
    );

  if (partnership_types.length === 0) {
    return { error: "Pick at least one partnership type." };
  }

  const update = {
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
    full_name: String(formData.get("full_name") ?? "").trim(),
    org_name: String(formData.get("org_name") ?? "").trim(),
    personal_email: String(formData.get("personal_email") ?? "")
      .trim()
      .toLowerCase(),
    website: String(formData.get("website") ?? "").trim() || null,
  };

  const admin = createAdminClient();
  const { error } = await admin.from("profiles").update(update).eq("id", user.id);

  if (error) return { error: `Could not save: ${error.message}` };

  redirect("/profile?saved=1");
}
