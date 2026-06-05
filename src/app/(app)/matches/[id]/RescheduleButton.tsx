"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

const REASONS: Record<string, string> = {
  calendar_not_connected:
    "One of you has disconnected Google Calendar — reconnect and try again.",
  google_oauth_not_configured: "Calendar integration is not configured.",
  no_overlap: "We couldn't find a new 30-minute window in the next 3 weeks.",
  missing_event_ids:
    "We don't have event IDs to update. Cancel and re-accept to start over.",
  match_not_found: "Match not found.",
  meeting_not_found: "No meeting to reschedule.",
  reschedule_limit_reached:
    "This meeting has already been rescheduled twice. The current time stands.",
};

type RescheduleButtonProps = {
  matchId: string;
  rescheduleCount: number;
  rescheduleLimit?: number;
};

export function RescheduleButton({
  matchId,
  rescheduleCount,
  rescheduleLimit = 2,
}: RescheduleButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const remaining = Math.max(0, rescheduleLimit - rescheduleCount);
  const atLimit = remaining === 0;

  function fire() {
    setError(null);
    startTransition(async () => {
      const res = await fetch(`/api/matches/${matchId}/reschedule`, {
        method: "POST",
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as {
          error?: string;
          message?: string;
        } | null;
        const reason = body?.error;
        setError(
          (reason && REASONS[reason]) ||
            body?.message ||
            "Could not reschedule. Try again in a minute.",
        );
        return;
      }
      setOpen(false);
      router.refresh();
    });
  }

  if (atLimit) {
    return (
      <button
        type="button"
        disabled
        title="This meeting has been rescheduled twice already."
        className="rounded-full border border-border bg-cream-deep px-4 py-2 text-xs font-medium text-muted"
      >
        Reschedules used (2/2)
      </button>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full border border-border bg-white px-4 py-2 text-xs font-medium text-ink transition hover:border-primary/40 hover:text-primary-fg active:scale-[0.98]"
      >
        Reschedule
        <span className="ml-1.5 text-muted">({remaining} left)</span>
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 backdrop-blur-sm md:items-center"
          role="dialog"
          aria-modal="true"
          onClick={() => !pending && setOpen(false)}
        >
          <div
            className="relative w-full max-w-md rounded-t-2xl bg-cream p-8 md:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="eyebrow">Reschedule</p>
            <h2 className="display mt-2 text-2xl text-ink md:text-3xl">
              Find a new time on both calendars?
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              We'll search both calendars for the next available 30-minute
              overlap (within the next 3 weeks) and move the event there. The
              Google Meet link stays the same. The other party gets an email
              about the new time.
            </p>
            <p className="mt-2 text-xs text-muted">
              You have <strong className="text-ink">{remaining}</strong>{" "}
              reschedule{remaining === 1 ? "" : "s"} left on this meeting.
              {remaining === 1 ? " After this one, the time is locked." : ""}
            </p>

            {error ? (
              <p className="mt-3 rounded-input bg-error/10 px-3 py-2 text-xs text-error">
                {error}
              </p>
            ) : null}

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button onClick={fire} loading={pending}>
                Yes, reschedule
              </Button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={pending}
                className="text-sm text-muted hover:text-ink disabled:opacity-50"
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
