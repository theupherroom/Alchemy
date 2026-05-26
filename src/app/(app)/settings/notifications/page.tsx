import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardBody } from "@/components/ui/Card";
import { NotificationsForm } from "./NotificationsForm";

export const metadata = { title: "Notifications — alchemy" };
export const dynamic = "force-dynamic";

export default async function NotificationsSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles_self")
    .select(
      "notify_match_request,notify_match_accepted,notify_meeting_scheduled,notify_weekly_digest",
    )
    .maybeSingle();

  return (
    <div className="container-app py-12 md:py-16">
      <div className="space-y-3 pb-10">
        <p className="eyebrow">Settings</p>
        <h1 className="display text-3xl text-ink md:text-4xl">Notifications</h1>
        <p className="max-w-md text-sm leading-relaxed text-muted">
          In-app notifications are always on so you don't miss a confirmed match
          or scheduled meeting. Email delivery is per-event below.
        </p>
      </div>

      <Card>
        <CardBody>
          <NotificationsForm
            defaults={{
              notify_match_request: profile?.notify_match_request ?? true,
              notify_match_accepted: profile?.notify_match_accepted ?? true,
              notify_meeting_scheduled: profile?.notify_meeting_scheduled ?? true,
              notify_weekly_digest: profile?.notify_weekly_digest ?? true,
            }}
          />
        </CardBody>
      </Card>
    </div>
  );
}
