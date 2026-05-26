"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  startsAt: string | null;
  meetLink: string | null;
};

// Full-bleed celebration shown immediately after the recipient accepts.
// Dismisses on click anywhere or after 6s. Cleans the ?just=accepted param
// from the URL so a refresh doesn't replay it.

export function CelebrationOverlay({ startsAt, meetLink }: Props) {
  const [visible, setVisible] = useState(true);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const t = setTimeout(() => dismiss(), 6000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function dismiss() {
    setVisible(false);
    // strip ?just=accepted from the URL after the fade-out
    setTimeout(() => router.replace(window.location.pathname), 350);
  }

  if (!visible && !mounted) return null;

  return (
    <div
      className={`fixed inset-0 z-[60] flex items-center justify-center bg-cream/95 backdrop-blur-md transition-opacity duration-300 ${
        visible && mounted ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
      onClick={dismiss}
      role="dialog"
      aria-modal="true"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-primary-bg/60 blur-[140px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 right-0 h-[420px] w-[420px] translate-x-1/3 translate-y-1/3 rounded-full bg-secondary-bg/60 blur-[120px]"
      />

      <div className="relative max-w-2xl px-6 text-center md:px-12">
        <p className="eyebrow mb-6">A confirmed match</p>
        <h1
          className="display text-5xl leading-[1.02] text-ink md:text-8xl"
          style={{
            animation: mounted
              ? "celebrate-pulse 1.2s ease-out 0.05s 1 both"
              : undefined,
          }}
        >
          It&apos;s a match.
        </h1>
        {startsAt ? (
          <p className="mx-auto mt-8 max-w-lg text-base leading-relaxed text-muted md:text-lg">
            Your intro meeting is on both calendars for{" "}
            <span className="text-ink">
              {new Date(startsAt).toLocaleString(undefined, {
                weekday: "long",
                month: "long",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </span>
            . You&apos;ll find out who they are when you show up.
          </p>
        ) : (
          <p className="mx-auto mt-8 max-w-lg text-base leading-relaxed text-muted md:text-lg">
            We&apos;re finding the first time you&apos;re both free. Watch
            your calendar — the invite will arrive within a few minutes.
          </p>
        )}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          {meetLink ? (
            <a
              href={meetLink}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex h-12 items-center rounded-full bg-primary px-7 text-sm font-medium text-white"
            >
              Open Google Meet
            </a>
          ) : null}
          <button
            type="button"
            onClick={dismiss}
            className="text-sm text-muted underline-offset-4 hover:text-ink hover:underline"
          >
            Continue
          </button>
        </div>
      </div>

      <style>{`
        @keyframes celebrate-pulse {
          0%   { transform: scale(0.96); opacity: 0; filter: blur(8px); }
          50%  { transform: scale(1.03); opacity: 1; filter: blur(0); }
          100% { transform: scale(1);    opacity: 1; filter: blur(0); }
        }
      `}</style>
    </div>
  );
}
