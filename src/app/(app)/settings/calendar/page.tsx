import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";

export const metadata = { title: "Calendar — alchemy" };

export default async function CalendarSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles_self")
    .select("calendar_connected")
    .maybeSingle();

  const { error } = await searchParams;
  const notConfigured = error === "not_configured";

  return (
    <div className="container-app py-16">
      <div className="space-y-3 pb-8">
        <p className="eyebrow">Settings</p>
        <h1 className="display text-3xl text-ink md:text-4xl">Calendar</h1>
        <p className="max-w-md text-sm leading-relaxed text-muted">
          We read your free/busy windows to find a 30-minute overlap when a
          match is confirmed. Event titles and attendees stay invisible to us.
        </p>
      </div>

      <Card>
        <CardBody className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-ink">
                Google Calendar
              </p>
              <p className="text-xs text-muted">
                {profile?.calendar_connected
                  ? "Connected"
                  : "Not connected — matches cannot be auto-scheduled."}
              </p>
            </div>
            <Link href="/api/google/connect">
              <Button variant={profile?.calendar_connected ? "outline" : "primary"}>
                {profile?.calendar_connected ? "Reconnect" : "Connect"}
              </Button>
            </Link>
          </div>

          {notConfigured ? (
            <p className="rounded-[10px] bg-warning/10 px-4 py-3 text-xs text-warning">
              Google OAuth is not yet configured on this deployment. Add
              GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET to your
              environment, then redeploy.
            </p>
          ) : null}
        </CardBody>
      </Card>
    </div>
  );
}
