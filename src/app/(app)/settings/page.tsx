import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardBody } from "@/components/ui/Card";

export const metadata = { title: "Settings — alchemy" };
export const dynamic = "force-dynamic";

export default async function SettingsHubPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="container-app py-12 md:py-16">
      <div className="space-y-3 pb-10">
        <p className="eyebrow">Settings</p>
        <h1 className="display text-3xl text-ink md:text-4xl">
          Account and integrations.
        </h1>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <SettingsLink
          href="/settings/account"
          eyebrow="Account"
          title="Email, password, deletion"
          description="Change your sign-in email, set a new password, or delete your account."
        />
        <SettingsLink
          href="/settings/calendar"
          eyebrow="Calendar"
          title="Google Calendar"
          description="Connect or disconnect the calendar we read free/busy from for auto-scheduling."
        />
        <SettingsLink
          href="/profile/edit"
          eyebrow="Profile"
          title="Mission & exchange fields"
          description="Update everything other members see beside your alias."
        />
        <SettingsLink
          href="/help"
          eyebrow="Need help"
          title="FAQ & support"
          description="Answers to common questions, or email a real person."
        />
      </div>
    </div>
  );
}

function SettingsLink({
  href,
  eyebrow,
  title,
  description,
}: {
  href: string;
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <Link href={href} className="group block">
      <Card className="h-full transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:-translate-y-0.5 group-hover:shadow-[var(--shadow-warm-lg)]">
        <CardBody className="space-y-3">
          <p className="eyebrow">{eyebrow}</p>
          <p className="display text-xl text-ink md:text-2xl">{title}</p>
          <p className="text-sm leading-relaxed text-muted">{description}</p>
          <p className="pt-2 text-xs text-primary underline-offset-4 group-hover:underline">
            Open →
          </p>
        </CardBody>
      </Card>
    </Link>
  );
}
