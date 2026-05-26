import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardBody } from "@/components/ui/Card";
import { Divider } from "@/components/ui/Divider";
import { EmailForm } from "./EmailForm";
import { PasswordForm } from "./PasswordForm";
import { DeleteAccountForm } from "./DeleteAccountForm";

export const metadata = { title: "Account — alchemy" };
export const dynamic = "force-dynamic";

export default async function AccountSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="container-app py-12 md:py-16">
      <div className="space-y-3 pb-10">
        <p className="eyebrow">Settings</p>
        <h1 className="display text-3xl text-ink md:text-4xl">Account</h1>
        <p className="max-w-md text-sm leading-relaxed text-muted">
          Email, password, and account deletion. Your alias and profile content
          live under{" "}
          <a
            href="/profile/edit"
            className="text-primary underline-offset-4 hover:underline"
          >
            Profile → Edit profile
          </a>
          .
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardBody className="space-y-5">
            <Section
              eyebrow="Email"
              title="Change your sign-in email."
              description="We'll send a confirmation link to the new address. Your old email keeps working until you click it."
            />
            <EmailForm currentEmail={user.email ?? ""} />
          </CardBody>
        </Card>

        <Card>
          <CardBody className="space-y-5">
            <Section
              eyebrow="Password"
              title="Set a new password."
              description="At least 8 characters. You'll stay signed in on this device."
            />
            <PasswordForm />
          </CardBody>
        </Card>

        <Divider />

        <Card className="border-error/30 bg-error/5">
          <CardBody className="space-y-5">
            <Section
              eyebrow="Danger zone"
              title="Delete your account."
              description="Removes your profile, matches, suggestions, flags, and calendar tokens. Existing meetings on your Google Calendar stay there. This cannot be undone."
              tone="error"
            />
            <DeleteAccountForm />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function Section({
  eyebrow,
  title,
  description,
  tone = "muted",
}: {
  eyebrow: string;
  title: string;
  description: string;
  tone?: "muted" | "error";
}) {
  return (
    <div className="space-y-2">
      <p
        className={
          tone === "error"
            ? "text-[10px] font-medium uppercase tracking-[0.2em] text-error"
            : "eyebrow"
        }
      >
        {eyebrow}
      </p>
      <h2 className="display text-xl text-ink md:text-2xl">{title}</h2>
      <p className="max-w-md text-sm leading-relaxed text-muted">
        {description}
      </p>
    </div>
  );
}
