import Link from "next/link";
import { LoginForm } from "./LoginForm";
import { MagicLinkForm } from "./MagicLinkForm";

export const metadata = { title: "Sign in — alchemy" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return (
    <div className="space-y-10 pt-10">
      <div className="space-y-3">
        <p className="eyebrow">Sign in</p>
        <h1 className="display text-4xl text-ink md:text-5xl">
          Welcome back.
        </h1>
        <p className="text-base leading-relaxed text-muted">
          Use the email and password you signed up with, or get a one-time
          magic link.
        </p>
      </div>

      <LoginForm next={next ?? "/dashboard"} />

      <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.18em] text-muted">
        <span className="h-px flex-1 bg-border" />
        <span>or</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <MagicLinkForm />

      <p className="text-sm text-muted">
        New here?{" "}
        <Link
          href="/signup"
          className="text-primary underline-offset-4 hover:underline"
        >
          Create an account
        </Link>
        .
      </p>
    </div>
  );
}
