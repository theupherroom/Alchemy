"use client";

import { useState, useTransition } from "react";
import { formatAlias } from "@/lib/alias/display";

type FlagButtonProps = {
  reportedId: string;
  reportedAlias: string;
};

export function FlagButton({ reportedId, reportedAlias }: FlagButtonProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, startTransition] = useTransition();

  function submit() {
    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/flags", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ reported: reportedId, reason: reason.trim() }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(body?.error ?? "Could not submit.");
        return;
      }
      setSuccess(true);
      setTimeout(() => {
        setOpen(false);
        setSuccess(false);
      }, 1200);
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-[11px] text-muted underline-offset-4 transition-colors hover:text-error hover:underline"
      >
        Report
      </button>
      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/30 backdrop-blur-sm md:items-center"
          role="dialog"
          aria-modal="true"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative w-full max-w-md rounded-t-2xl bg-cream p-8 md:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="eyebrow">Report</p>
            <h2 className="display mt-2 text-2xl text-ink">
              Flag {formatAlias(reportedAlias)}?
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Use this for bad-faith behavior — no-shows, harassment, or
              misrepresentation. Three flags suspend a profile automatically.
            </p>
            <label className="mt-4 block text-xs font-medium text-ink">
              Why are you flagging? <span className="text-muted">(optional)</span>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                className="mt-2 w-full rounded-input border border-border bg-white p-3 text-sm leading-relaxed focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="No-show for our scheduled meeting last week…"
              />
            </label>
            {error ? (
              <p className="mt-3 rounded-input bg-error/10 px-3 py-2 text-xs text-error">
                {error}
              </p>
            ) : null}
            {success ? (
              <p className="mt-3 rounded-input bg-success/10 px-3 py-2 text-xs text-success">
                Flag submitted. Thank you for keeping the platform honest.
              </p>
            ) : null}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={submit}
                disabled={pending || success}
                className="inline-flex h-11 items-center rounded-full bg-error px-6 text-sm font-medium text-white transition-opacity active:scale-[0.98] disabled:opacity-50"
              >
                {pending ? "Submitting…" : "Submit flag"}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-sm text-muted hover:text-ink"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
