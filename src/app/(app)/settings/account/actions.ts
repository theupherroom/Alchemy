"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type AccountActionState = {
  error?: string;
  ok?: string;
};

export async function updateEmailAction(
  _prev: AccountActionState,
  formData: FormData,
): Promise<AccountActionState> {
  const next = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!next || !next.includes("@")) {
    return { error: "Enter a valid email." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Session expired. Sign in again." };
  if (next === user.email) {
    return { error: "That's already your current email." };
  }

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const { error } = await supabase.auth.updateUser(
    { email: next },
    { emailRedirectTo: `${appUrl}/auth/callback?next=/settings/account` },
  );

  if (error) return { error: error.message };

  return {
    ok: `Confirmation sent to ${next}. Click the link to finish the change — your current email keeps working until then.`,
  };
}

export async function updatePasswordAction(
  _prev: AccountActionState,
  formData: FormData,
): Promise<AccountActionState> {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (password.length < 8) {
    return { error: "Use at least 8 characters." };
  }
  if (password !== confirm) {
    return { error: "Passwords don't match." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Session expired. Sign in again." };

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };

  return { ok: "Password updated." };
}

export async function deleteAccountAction(
  formData: FormData,
): Promise<{ error?: string } | void> {
  const confirm = String(formData.get("confirm") ?? "").trim();
  if (confirm !== "DELETE") {
    return { error: "Type DELETE exactly to confirm." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Session expired. Sign in again." };

  const admin = createAdminClient();

  // Cascading FK deletes profiles, matches, meetings, flags, oauth tokens.
  // Auth user removed last so the cascade has time to complete.
  const userId = user.id;

  const { error: profileDeleteError } = await admin
    .from("profiles")
    .delete()
    .eq("id", userId);
  if (profileDeleteError) {
    return { error: `Could not delete profile: ${profileDeleteError.message}` };
  }

  const { error: authDeleteError } = await admin.auth.admin.deleteUser(userId);
  if (authDeleteError) {
    return { error: `Could not delete auth: ${authDeleteError.message}` };
  }

  await supabase.auth.signOut();
  redirect("/?deleted=1");
}
