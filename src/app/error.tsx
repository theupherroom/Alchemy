"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error("page error", error);
  }, [error]);

  return (
    <div className="relative flex min-h-[100dvh] items-center overflow-hidden bg-cream">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-error/20 blur-[120px]"
      />
      <div className="container-form relative z-10 py-24 text-center">
        <p className="alias-code text-xs uppercase tracking-[0.22em] text-error">
          Something broke
        </p>
        <h1 className="display mt-4 text-5xl text-ink md:text-7xl">
          We hit a snag.
        </h1>
        <p className="mx-auto mt-6 max-w-md text-base leading-relaxed text-muted">
          The page failed to load. Try again — if it keeps happening, email{" "}
          <a
            href="mailto:hello@theupherroom.com"
            className="text-primary underline-offset-4 hover:underline"
          >
            hello@theupherroom.com
          </a>{" "}
          with the reference below.
        </p>
        {error.digest ? (
          <p className="alias-code mt-3 text-xs text-muted">{error.digest}</p>
        ) : null}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-11 items-center rounded-full bg-primary px-6 text-sm font-medium text-white"
          >
            Try again
          </button>
          <Link
            href="/"
            className="text-sm text-muted underline-offset-4 hover:text-ink hover:underline"
          >
            Back home
          </Link>
        </div>
      </div>
    </div>
  );
}
