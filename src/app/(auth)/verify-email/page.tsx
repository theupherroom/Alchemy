import Link from "next/link";

export const metadata = { title: "Check your inbox — alchemy" };

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  return (
    <div className="space-y-10 pt-16">
      <p className="eyebrow">Almost in</p>
      <h1 className="display text-4xl text-ink md:text-5xl">
        Check your inbox.
      </h1>
      <p className="max-w-md text-base leading-relaxed text-muted">
        We sent a confirmation link to{" "}
        <span className="text-ink">{email ?? "your email"}</span>. Open it to
        finish signing in, then we will walk you through your anonymous
        profile.
      </p>
      <p className="text-sm text-muted">
        Wrong email?{" "}
        <Link
          href="/signup"
          className="text-primary underline-offset-4 hover:underline"
        >
          Start over
        </Link>
        .
      </p>
    </div>
  );
}
