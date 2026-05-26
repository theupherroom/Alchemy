"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import type { CompatibilityAxis } from "@/lib/matching/compatibility";

type CompatibilityBarsProps = {
  axes: CompatibilityAxis[];
};

export function CompatibilityBars({ axes }: CompatibilityBarsProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      setActive(true);
      return;
    }
    if (typeof IntersectionObserver === "undefined") {
      setActive(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          io.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className="space-y-4">
      {axes.map((axis) => (
        <Bar key={axis.key} axis={axis} active={active} />
      ))}
    </div>
  );
}

function Bar({ axis, active }: { axis: CompatibilityAxis; active: boolean }) {
  const tone =
    axis.score >= 80
      ? "bg-primary"
      : axis.score >= 60
        ? "bg-primary/70"
        : axis.score >= 40
          ? "bg-secondary"
          : "bg-cream-tint";
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="font-medium text-ink">{axis.label}</span>
        <span className="alias-code tabular-nums text-xs text-muted">
          {axis.score}/100
        </span>
      </div>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-cream-tint">
        <span
          className={cn(
            "absolute left-0 top-0 h-full rounded-full transition-[width] duration-[1100ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
            tone,
          )}
          style={{ width: active ? `${axis.score}%` : "0%" }}
        />
      </div>
      <p className="text-[11px] leading-relaxed text-muted">{axis.detail}</p>
    </div>
  );
}
