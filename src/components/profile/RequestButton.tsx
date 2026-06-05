"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { formatAlias } from "@/lib/alias/display";

type RequestButtonProps = {
  candidateId: string;
  candidateAlias: string;
  initialStatus: "pending" | "accepted" | "declined" | null;
};

export function RequestButton({
  candidateId,
  candidateAlias,
  initialStatus,
}: RequestButtonProps) {
  const [status, setStatus] = useState(initialStatus);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function send() {
    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/matches/request", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ candidate: candidateId }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(body?.error ?? "Could not send request.");
        return;
      }
      setStatus("pending");
      setOpen(false);
    });
  }

  if (status === "pending") {
    return (
      <Button variant="outline" fullWidth disabled>
        Request sent
      </Button>
    );
  }
  if (status === "accepted") {
    return (
      <Button variant="secondary" fullWidth disabled>
        Match confirmed
      </Button>
    );
  }
  if (status === "declined") {
    return (
      <Button variant="ghost" fullWidth disabled>
        Declined
      </Button>
    );
  }

  return (
    <>
      <Button fullWidth onClick={() => setOpen(true)}>
        Request to connect
      </Button>
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
            <p className="eyebrow">A request to connect</p>
            <h2 className="display mt-2 text-2xl text-ink md:text-3xl">
              Send a request to {formatAlias(candidateAlias)}?
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              They'll see your anonymous profile and decide. If they accept,
              we'll book the meeting for you — no back-and-forth.
            </p>
            {error ? (
              <p className="mt-3 rounded-input bg-error/10 px-3 py-2 text-xs text-error">
                {error}
              </p>
            ) : null}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button onClick={send} loading={pending}>
                Send request
              </Button>
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Not yet
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
