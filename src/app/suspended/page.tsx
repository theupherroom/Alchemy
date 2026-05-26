import Link from "next/link";

export const metadata = { title: "Account suspended — alchemy" };

export default function SuspendedPage() {
  return (
    <div className="flex min-h-[100dvh] items-center bg-cream">
      <div className="container-form text-center">
        <p className="eyebrow">Suspended</p>
        <h1 className="display mt-3 text-4xl text-ink md:text-5xl">
          Your account has been paused.
        </h1>
        <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-muted">
          Three members of the community flagged your profile. To keep
          introductions safe and good-faith, the platform pauses accounts at
          that threshold.
        </p>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted">
          If you believe this was in error, write to{" "}
          <a
            href="mailto:hello@upherroom.com"
            className="text-primary underline-offset-4 hover:underline"
          >
            hello@upherroom.com
          </a>
          .
        </p>
        <div className="mt-10">
          <form action="/auth/logout" method="post" className="inline-block">
            <button
              type="submit"
              className="inline-flex h-11 items-center rounded-full border border-border bg-white px-6 text-sm font-medium text-ink"
            >
              Sign out
            </button>
          </form>
        </div>
        <p className="mt-12 text-xs text-muted">
          <Link href="/" className="hover:text-ink">
            ← Back to homepage
          </Link>
        </p>
      </div>
    </div>
  );
}
