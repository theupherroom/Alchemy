import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/Badge";
import { ProfileEditForm } from "./ProfileEditForm";

export const metadata = { title: "Edit profile — alchemy" };
export const dynamic = "force-dynamic";

export default async function ProfileEditPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles_self")
    .select("*")
    .maybeSingle();

  if (!profile) redirect("/onboarding");

  return (
    <div className="container-form py-12 md:py-16">
      <div className="space-y-3 pb-10">
        <p className="eyebrow">Edit profile</p>
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h1 className="display text-3xl text-ink md:text-4xl">
            What can others see?
          </h1>
          <Badge variant="primary" className="alias-code">
            {profile.alias}
          </Badge>
        </div>
        <p className="max-w-md text-sm leading-relaxed text-muted">
          Your alias is permanent. Everything below can be updated — changes
          appear on browse cards within seconds.
        </p>
      </div>

      <ProfileEditForm
        defaults={{
          mission_statement: profile.mission_statement,
          sector: profile.sector,
          org_type: profile.org_type,
          stage: profile.stage,
          partnership_types: profile.partnership_types,
          what_we_offer: profile.what_we_offer,
          what_we_need: profile.what_we_need,
          geographic_reach: profile.geographic_reach,
          region: profile.region ?? "",
          impact_statement: profile.impact_statement ?? "",
          full_name: profile.full_name,
          org_name: profile.org_name,
          personal_email: profile.personal_email,
          website: profile.website ?? "",
        }}
      />
    </div>
  );
}
