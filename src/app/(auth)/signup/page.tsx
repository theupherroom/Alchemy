import Link from "next/link";
import { SignupForm } from "./SignupForm";

export const metadata = { title: "Create account — alchemy" };

export default function SignupPage() {
  return (
    <div className="space-y-10 pt-10">
      <div className="space-y-3">
        <p className="eyebrow">Create account</p>
        <h1 className="display text-4xl text-ink md:text-5xl">
          Start with the mission.
        </h1>
        <p className="text-base leading-relaxed text-muted">
          You will create an anonymous profile. The platform reveals your
          identity only after a confirmed mutual match, at the meeting itself.
        </p>
      </div>

      <SignupForm />

      <p className="text-sm text-muted">
        Already a member?{" "}
        <Link
          href="/login"
          className="text-primary underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
        .
      </p>
    </div>
  );
}
