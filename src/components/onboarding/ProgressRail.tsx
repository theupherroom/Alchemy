"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

type Section = {
  id: string;
  label: string;
};

type ProgressRailProps = {
  sections: Section[];
};

// Sticky rail that tracks the user's scroll position through the onboarding
// form sections. Uses IntersectionObserver on data-section anchors that the
// form renders. No work on the main thread per scroll event.

export function ProgressRail({ sections }: ProgressRailProps) {
  const [active, setActive] = useState(0);
  const observers = useRef<IntersectionObserver[]>([]);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;

    observers.current.forEach((io) => io.disconnect());
    observers.current = [];

    sections.forEach((section, i) => {
      const el = document.querySelector(`[data-section="${section.id}"]`);
      if (!el) return;
      const io = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActive(i);
        },
        { rootMargin: "-30% 0px -55% 0px", threshold: 0 },
      );
      io.observe(el);
      observers.current.push(io);
    });

    return () => {
      observers.current.forEach((io) => io.disconnect());
    };
  }, [sections]);

  return (
    <div className="sticky top-4 z-30 mx-auto -mt-2 mb-10 max-w-fit rounded-full border border-border bg-white/80 px-3 py-2 backdrop-blur-md">
      <ol className="flex items-center gap-3">
        {sections.map((section, i) => {
          const done = i < active;
          const current = i === active;
          return (
            <li key={section.id} className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-medium transition-colors duration-300",
                  current
                    ? "bg-primary text-white"
                    : done
                      ? "bg-primary-bg text-primary-fg"
                      : "bg-cream-deep text-muted",
                )}
              >
                {done ? "✓" : i + 1}
              </span>
              <span
                className={cn(
                  "hidden text-xs transition-colors duration-300 sm:inline",
                  current ? "text-ink" : "text-muted",
                )}
              >
                {section.label}
              </span>
              {i < sections.length - 1 ? (
                <span
                  aria-hidden="true"
                  className={cn(
                    "ml-1 h-px w-6 transition-colors duration-300",
                    done ? "bg-primary/40" : "bg-border",
                  )}
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
