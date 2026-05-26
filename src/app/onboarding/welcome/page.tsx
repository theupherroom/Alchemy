import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";

export const metadata = { title: "You are Partner … — alchemy" };

export default async function OnboardingWelcomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles_self")
    .select("alias,calendar_connected")
    .maybeSingle();

  if (!profile) redirect("/onboarding");

  return (
    <div className="min-h-[100dvh] bg-cream">
      <div className="container-form py-24">
        <div className="space-y-12">
          <div className="space-y-4">
            <p className="eyebrow">You are now</p>
            <h1 className="display text-5xl text-ink md:text-7xl">
              {profile.alias}
            </h1>
            <p className="alias-code text-sm text-muted">
              This is the only name other members will see until a meeting
              starts.
            </p>
          </div>

          <Card>
            <CardBody className="space-y-5">
              <div>
                <p className="eyebrow">One more step</p>
                <h2 className="display mt-2 text-2xl text-ink">
                  Connect your calendar.
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  When you and a match both accept, we read your free/busy
                  windows and book a 30-minute intro on the first time you are
                  both free. We never see event titles or attendees.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/api/google/connect">
                  <Button>Connect Google Calendar</Button>
                </Link>
                <Link href="/browse">
                  <Button variant="ghost">Skip for now</Button>
                </Link>
              </div>
            </CardBody>
          </Card>

          <p className="text-xs leading-relaxed text-muted">
            You can connect or disconnect any time from
            <Link
              href="/settings/calendar"
              className="ml-1 text-primary underline-offset-4 hover:underline"
            >
              settings
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
