"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

type ScoreBubbleProps = {
  score: number | null;
  className?: string;
  size?: "sm" | "md";
};

export function ScoreBubble({ score, className, size = "md" }: ScoreBubbleProps) {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    if (score === null) {
      setDisplayed(0);
      return;
    }
    const start = performance.now();
    const duration = 800;
    let frame: number;
    function tick(now: number) {
      const t = Math.min(1, (now - start) / duration);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayed(Math.round((score ?? 0) * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [score]);

  if (score === null) {
    return (
      <span
        className={cn(
          "alias-code inline-flex items-center rounded-full bg-cream-deep px-3 py-1 text-xs text-muted",
          size === "sm" && "px-2 py-0.5 text-[10px]",
          className,
        )}
        aria-label="match score pending"
      >
        — match
      </span>
    );
  }

  const tone =
    score >= 80
      ? "bg-primary text-white shadow-press"
      : score >= 60
        ? "bg-primary-bg text-primary-fg"
        : "bg-cream-tint text-muted";

  return (
    <span
      className={cn(
        "alias-code inline-flex items-center rounded-full px-3 py-1 text-xs tabular-nums",
        size === "sm" && "px-2 py-0.5 text-[10px]",
        tone,
        className,
      )}
      aria-label={`${score} percent match`}
    >
      {displayed}% match
    </span>
  );
}
