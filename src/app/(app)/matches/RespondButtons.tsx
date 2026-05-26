"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

type RespondButtonsProps = {
  matchId: string;
  // When true, accept navigates to /matches/[id]?just=accepted (celebration).
  // When false, just refreshes the current route.
  redirectOnAccept?: boolean;
};

export function RespondButtons({
  matchId,
  redirectOnAccept,
}: RespondButtonsProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function respond(action: "accept" | "decline") {
    setError(null);
    startTransition(async () => {
      const res = await fetch(`/api/matches/${matchId}/respond`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        setError(body?.error ?? "Something went wrong.");
        return;
      }
      if (action === "accept" && redirectOnAccept) {
        router.push(`/matches/${matchId}?just=accepted`);
      } else if (action === "accept") {
        router.push(`/matches/${matchId}?just=accepted`);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => respond("accept")} loading={pending}>
          Accept
        </Button>
        <Button
          variant="ghost"
          onClick={() => respond("decline")}
          disabled={pending}
        >
          Decline
        </Button>
      </div>
      {error ? <p className="text-xs text-error">{error}</p> : null}
    </div>
  );
}
