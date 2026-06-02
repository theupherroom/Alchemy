import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/admin";
import { renderApprovedEmail } from "./templates/approved";

const FROM_FALLBACK = "connect@alchemy.theupherroom.com";

// Sends the "Your profile is live" email after an admin approves a user.
// No-ops gracefully if Resend isn't configured.
export async function sendApprovalEmail(userId: string): Promise<{
  sent: boolean;
  error?: string;
}> {
  if (!process.env.RESEND_API_KEY) {
    return { sent: false, error: "RESEND_API_KEY not configured" };
  }

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("alias, personal_email")
    .eq("id", userId)
    .maybeSingle();

  if (!profile) {
    return { sent: false, error: "profile not found" };
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const fromAddress = process.env.RESEND_FROM_ADDRESS || FROM_FALLBACK;
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://alchemy.theupherroom.com";

  try {
    await resend.emails.send({
      from: `Alchemy <${fromAddress}>`,
      to: profile.personal_email,
      subject: `${profile.alias}, your alchemy profile is live`,
      html: renderApprovedEmail({ alias: profile.alias, appUrl }),
    });
    return { sent: true };
  } catch (err) {
    return { sent: false, error: err instanceof Error ? err.message : "unknown" };
  }
}
