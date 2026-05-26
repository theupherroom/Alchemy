import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Reveal } from "@/components/landing/Reveal";
import { Grain } from "@/components/landing/Grain";

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
    <div className="relative min-h-[100dvh] overflow-hidden bg-cream">
      <Grain />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-primary-bg/60 blur-[140px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 right-0 h-[420px] w-[420px] translate-x-1/3 translate-y-1/3 rounded-full bg-secondary-bg/50 blur-[120px]"
      />

      <div className="relative z-10 container-form py-24 md:py-32">
        <div className="space-y-14">
          <div className="space-y-5 text-center md:text-left">
            <Reveal>
              <p className="eyebrow">You are now</p>
            </Reveal>

            <Reveal delay={140}>
              <h1
                className="display text-6xl leading-[1.02] text-ink md:text-[6.5rem]"
                style={{ animation: "alias-pulse 1.2s ease-out 0.4s 1 both" }}
              >
                {profile.alias}
              </h1>
            </Reveal>

            <Reveal delay={280}>
              <p className="alias-code mx-auto max-w-md text-sm text-muted md:mx-0">
                This is the only name other members will ever see — until the
                meeting itself.
              </p>
            </Reveal>
          </div>

          <Reveal delay={360}>
            <Card className="overflow-hidden">
              <CardBody className="space-y-6">
                <div>
                  <p className="eyebrow">Optional — recommended</p>
                  <h2 className="display mt-3 text-3xl text-ink md:text-4xl">
                    Connect your calendar.
                  </h2>
                  <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
                    When you and a match both accept, we read your free/busy
                    windows and book a 30-minute intro for you. Skip for now
                    if you prefer — you can connect any time from settings.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Link href="/browse">
                    <Button>Continue to browse</Button>
                  </Link>
                  <Link href="/api/google/connect">
                    <Button variant="outline">Connect Google Calendar</Button>
                  </Link>
                </div>
              </CardBody>
            </Card>
          </Reveal>

          <Reveal delay={460}>
            <p className="text-xs leading-relaxed text-muted">
              Without a calendar connected, matches will pause at the
              scheduling step until both members are connected. You can
              update this any time in
              <Link
                href="/settings/calendar"
                className="ml-1 text-primary underline-offset-4 hover:underline"
              >
                settings
              </Link>
              .
            </p>
          </Reveal>
        </div>
      </div>

      <style>{`
        @keyframes alias-pulse {
          0%   { transform: scale(1);    opacity: 0; filter: blur(6px); }
          40%  { transform: scale(1.02); opacity: 1; filter: blur(0); }
          70%  { transform: scale(1);    opacity: 1; filter: blur(0); }
          100% { transform: scale(1);    opacity: 1; filter: blur(0); }
        }
      `}</style>
    </div>
  );
}
