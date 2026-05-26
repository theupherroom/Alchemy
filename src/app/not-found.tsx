import Link from "next/link";

export const metadata = { title: "Not found — alchemy" };

export default function NotFound() {
  return (
    <div className="relative flex min-h-[100dvh] items-center overflow-hidden bg-cream">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-primary-bg/50 blur-[120px]"
      />
      <div className="container-form relative z-10 py-24 text-center">
        <p className="alias-code text-xs uppercase tracking-[0.22em] text-bronze">
          404
        </p>
        <h1 className="display mt-4 text-5xl text-ink md:text-7xl">
          This room is empty.
        </h1>
        <p className="mx-auto mt-6 max-w-md text-base leading-relaxed text-muted">
          The page you were looking for either moved or never existed. No
          identities were leaked in the making of this error.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/"
            className="inline-flex h-11 items-center rounded-full bg-primary px-6 text-sm font-medium text-white"
          >
            Back home
          </Link>
          <Link
            href="/dashboard"
            className="text-sm text-muted underline-offset-4 hover:text-ink hover:underline"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
