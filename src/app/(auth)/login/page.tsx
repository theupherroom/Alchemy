import Link from "next/link";
import { LoginForm } from "./LoginForm";

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
          Use the email and password you signed up with.
        </p>
      </div>

      <LoginForm next={next ?? "/browse"} />

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
