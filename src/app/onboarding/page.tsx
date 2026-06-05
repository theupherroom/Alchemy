import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OnboardingForm } from "./OnboardingForm";

export const metadata = { title: "Build your profile — alchemy" };

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles_self")
    .select("onboarded_at")
    .maybeSingle();

  if (profile?.onboarded_at) {
    redirect("/onboarding/welcome");
  }

  return (
    <div className="min-h-[100dvh] bg-cream">
      <div className="container-form py-16">
        <div className="space-y-3 pb-12">
          <p className="eyebrow">Onboarding</p>
          <h1 className="display text-4xl text-ink md:text-5xl">
            Your anonymous profile.
          </h1>
          <p className="max-w-md text-base leading-relaxed text-muted">
            Lead with the mission. Name and organization stay hidden until you
            and a match are both on the calendar.
          </p>
        </div>

        <OnboardingForm email={user.email ?? ""} />
      </div>
    </div>
  );
}
