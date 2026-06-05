import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";

export const metadata = { title: "Calendar — alchemy" };
export const dynamic = "force-dynamic";

export default async function CalendarSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string;
    connected?: string;
    disconnected?: string;
  }>;
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

  const sp = await searchParams;
  const notConfigured = sp.error === "not_configured";
  const otherError = sp.error && sp.error !== "not_configured" ? sp.error : null;
  const justConnected = sp.connected === "1";
  const justDisconnected = sp.disconnected === "1";

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
              <p className="text-sm font-medium text-ink">Google Calendar</p>
              <p className="text-xs text-muted">
                {profile?.calendar_connected
                  ? "Connected"
                  : "Not connected — matches cannot be auto-scheduled."}
              </p>
            </div>
            <div className="flex gap-2">
              <Link href="/api/google/connect">
                <Button
                  variant={profile?.calendar_connected ? "outline" : "primary"}
                >
                  {profile?.calendar_connected ? "Reconnect" : "Connect"}
                </Button>
              </Link>
              {profile?.calendar_connected ? (
                <form action="/api/google/disconnect" method="post">
                  <Button type="submit" variant="ghost">
                    Disconnect
                  </Button>
                </form>
              ) : null}
            </div>
          </div>

          {justConnected ? (
            <p className="rounded-input bg-success/10 px-4 py-3 text-xs text-success">
              Calendar connected. Future matches will be auto-scheduled.
            </p>
          ) : null}
          {justDisconnected ? (
            <p className="rounded-input bg-warning/10 px-4 py-3 text-xs text-warning">
              Calendar disconnected. Auto-scheduling is paused until you
              reconnect.
            </p>
          ) : null}
          {notConfigured ? (
            <p className="rounded-input bg-warning/10 px-4 py-3 text-xs text-warning">
              Google OAuth is not yet configured on this deployment. Set
              GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET, and
              GOOGLE_OAUTH_REDIRECT_URI in your environment, then redeploy.
            </p>
          ) : null}
          {otherError ? (
            <p className="rounded-input bg-error/10 px-4 py-3 text-xs text-error">
              {otherError}
            </p>
          ) : null}
        </CardBody>
      </Card>
    </div>
  );
}
