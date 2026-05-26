"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  target: number;
  duration?: number;
  startDelay?: number;
};

// Reusable count-up that triggers only when its container scrolls into view.

export function AnimatedScore({
  target,
  duration = 1200,
  startDelay = 200,
}: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setValue(target);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const start = performance.now() + startDelay;
        let frame: number;
        function tick(now: number) {
          const elapsed = now - start;
          if (elapsed < 0) {
            frame = requestAnimationFrame(tick);
            return;
          }
          const t = Math.min(1, elapsed / duration);
          const eased = 1 - Math.pow(1 - t, 3);
          setValue(Math.round(target * eased));
          if (t < 1) frame = requestAnimationFrame(tick);
        }
        frame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [target, duration, startDelay]);

  return (
    <span ref={ref} className="tabular-nums">
      {value}
    </span>
  );
}
