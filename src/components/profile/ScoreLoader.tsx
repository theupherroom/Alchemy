"use client";

import { useEffect, useState } from "react";
import { ScoreBubble } from "./ScoreBubble";

type ScoreLoaderProps = {
  candidateId: string;
};

// Fetches /api/score for the given candidate on mount, then renders ScoreBubble.
// Server returns cached score in milliseconds; uncached cases hit Claude (1-3s).

export function ScoreLoader({ candidateId }: ScoreLoaderProps) {
  const [score, setScore] = useState<number | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/score?candidate=${encodeURIComponent(candidateId)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("score_failed"))))
      .then((data: { score: number | null }) => {
        if (!cancelled) setScore(data.score);
      })
      .catch(() => {
        if (!cancelled) setScore(null);
      });
    return () => {
      cancelled = true;
    };
  }, [candidateId]);

  return <ScoreBubble score={score === undefined ? null : score} />;
}
