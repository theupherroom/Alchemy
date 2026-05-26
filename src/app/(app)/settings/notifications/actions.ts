"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type Prefs = {
  notify_match_request: boolean;
  notify_match_accepted: boolean;
  notify_meeting_scheduled: boolean;
  notify_weekly_digest: boolean;
};

export type NotificationsState = {
  ok?: string;
  error?: string;
};

export async function updateNotificationPrefs(
  _prev: NotificationsState,
  formData: FormData,
): Promise<NotificationsState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Session expired. Sign in again." };

  const prefs: Prefs = {
    notify_match_request: formData.get("notify_match_request") === "on",
    notify_match_accepted: formData.get("notify_match_accepted") === "on",
    notify_meeting_scheduled: formData.get("notify_meeting_scheduled") === "on",
    notify_weekly_digest: formData.get("notify_weekly_digest") === "on",
  };

  const { error } = await supabase
    .from("profiles")
    .update(prefs)
    .eq("id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/settings/notifications");
  return { ok: "Preferences saved." };
}
