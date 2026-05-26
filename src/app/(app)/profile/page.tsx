import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardBody } from "@/components/ui/Card";
import { Divider } from "@/components/ui/Divider";
import {
  GEO_OPTIONS,
  ORG_TYPE_OPTIONS,
  PARTNERSHIP_TYPE_OPTIONS,
  SECTOR_OPTIONS,
  STAGE_OPTIONS,
  labelOf,
} from "@/lib/profile/enums";

export const metadata = { title: "Your profile — alchemy" };
export const dynamic = "force-dynamic";

export default async function ProfilePage() {
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
    <div className="container-app py-12 md:py-16">
      <div className="space-y-2 pb-8">
        <p className="eyebrow">Your profile</p>
        <h1 className="display text-3xl text-ink md:text-5xl">
          {profile.alias}
        </h1>
        <p className="alias-code text-xs text-muted">
          The only name other members see until a confirmed meeting.
        </p>
      </div>

      <Card>
        <CardBody className="space-y-6">
          <Section title="Mission">{profile.mission_statement}</Section>

          <Divider />

          <div className="grid gap-6 md:grid-cols-2">
            <KeyValue label="Sector" value={labelOf(SECTOR_OPTIONS, profile.sector)} />
            <KeyValue
              label="Organisation type"
              value={labelOf(ORG_TYPE_OPTIONS, profile.org_type)}
            />
            <KeyValue label="Stage" value={labelOf(STAGE_OPTIONS, profile.stage)} />
            <KeyValue
              label="Geographic reach"
              value={labelOf(GEO_OPTIONS, profile.geographic_reach)}
            />
            {profile.region ? (
              <KeyValue label="Region" value={profile.region} />
            ) : null}
            <KeyValue
              label="Partnership types"
              value={profile.partnership_types
                .map((t) => labelOf(PARTNERSHIP_TYPE_OPTIONS, t))
                .join(" · ")}
            />
          </div>

          <Divider />

          <Section title="What you offer">{profile.what_we_offer}</Section>
          <Section title="What you need">{profile.what_we_need}</Section>

          {profile.impact_statement ? (
            <>
              <Divider />
              <Section title="Impact">{profile.impact_statement}</Section>
            </>
          ) : null}
        </CardBody>
      </Card>

      <Card className="mt-6">
        <CardBody className="space-y-4">
          <p className="eyebrow">Private — only ever shown at the meeting</p>
          <div className="grid gap-4 md:grid-cols-2">
            <KeyValue label="Full name" value={profile.full_name} />
            <KeyValue label="Organisation" value={profile.org_name} />
            <KeyValue label="Email" value={profile.personal_email} />
            {profile.website ? (
              <KeyValue label="Website" value={profile.website} />
            ) : null}
          </div>
          <p className="text-xs leading-relaxed text-muted">
            These never appear in the directory, in search results, in match
            previews, or in the calendar event. The first time another
            member sees them is when you both join the intro meeting.
          </p>
        </CardBody>
      </Card>

      <div className="mt-6 flex justify-end">
        <Link
          href="/settings/calendar"
          className="text-sm text-primary underline-offset-4 hover:underline"
        >
          Calendar settings →
        </Link>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
        {title}
      </p>
      <p className="text-base leading-relaxed text-ink">{children}</p>
    </div>
  );
}

function KeyValue({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted">
        {label}
      </p>
      <p className="text-sm text-ink">{value}</p>
    </div>
  );
}
