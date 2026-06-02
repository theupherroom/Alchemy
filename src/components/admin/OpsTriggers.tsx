"use client";

import { useState, useTransition } from "react";

type Job = {
  key: "suggestions" | "expire-matches" | "digest";
  label: string;
  description: string;
};

const JOBS: Job[] = [
  {
    key: "suggestions",
    label: "Refresh suggestions",
    description:
      "Rescore every active user against the candidate pool. Slow — 1-2 minutes for ~50 users.",
  },
  {
    key: "expire-matches",
    label: "Expire stale matches",
    description:
      "Mark pending matches older than 14 days as expired. Fast.",
  },
  {
    key: "digest",
    label: "Send weekly digest",
    description:
      "Email each opted-in user their top 3 suggestions. Use sparingly outside the regular schedule.",
  },
];

export function OpsTriggers() {
  const [pending, startTransition] = useTransition();
  const [results, setResults] = useState<
    Record<string, { ok: boolean; message: string } | undefined>
  >({});

  function fire(job: Job) {
    startTransition(async () => {
      setResults((r) => ({ ...r, [job.key]: undefined }));
      const res = await fetch(`/api/admin/cron/${job.key}`, { method: "POST" });
      const body = (await res.json().catch(() => ({}))) as Record<
        string,
        unknown
      >;
      setResults((r) => ({
        ...r,
        [job.key]: {
          ok: res.ok,
          message: res.ok
            ? JSON.stringify(body)
            : (body.error as string) ?? `HTTP ${res.status}`,
        },
      }));
    });
  }

  return (
    <ul className="space-y-4">
      {JOBS.map((j) => {
        const result = results[j.key];
        return (
          <li
            key={j.key}
            className="rounded-2xl border border-border bg-white p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-ink">{j.label}</p>
                <p className="mt-1 max-w-md text-xs leading-relaxed text-muted">
                  {j.description}
                </p>
              </div>
              <button
                type="button"
                onClick={() => fire(j)}
                disabled={pending}
                className="rounded-full bg-primary px-4 py-2 text-xs font-medium text-white transition active:scale-[0.98] disabled:opacity-50"
              >
                {pending ? "Running…" : "Run now"}
              </button>
            </div>
            {result ? (
              <p
                className={
                  result.ok
                    ? "mt-3 rounded-[10px] bg-success-bg px-3 py-2 text-xs text-success"
                    : "mt-3 rounded-[10px] bg-error/10 px-3 py-2 text-xs text-error"
                }
              >
                {result.message}
              </p>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
