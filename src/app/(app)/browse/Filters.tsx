"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { cn } from "@/lib/cn";
import {
  GEO_OPTIONS,
  PARTNERSHIP_TYPE_OPTIONS,
  SECTOR_OPTIONS,
  STAGE_OPTIONS,
} from "@/lib/profile/enums";

type Group = {
  key: "sector" | "partnership_type" | "stage" | "geo";
  label: string;
  options: { value: string; label: string }[];
};

const GROUPS: Group[] = [
  { key: "sector", label: "Sector", options: SECTOR_OPTIONS },
  { key: "partnership_type", label: "Partnership", options: PARTNERSHIP_TYPE_OPTIONS },
  { key: "stage", label: "Stage", options: STAGE_OPTIONS },
  { key: "geo", label: "Reach", options: GEO_OPTIONS },
];

const SEARCH_DEBOUNCE_MS = 300;

export function Filters() {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [q, setQ] = useState(params.get("q") ?? "");

  // Debounce search input -> URL
  useEffect(() => {
    const initial = params.get("q") ?? "";
    if (q === initial) return;
    const id = setTimeout(() => {
      const next = new URLSearchParams(params);
      if (q.trim()) {
        next.set("q", q.trim());
      } else {
        next.delete("q");
      }
      startTransition(() => {
        router.replace(next.toString() ? `?${next.toString()}` : "?", {
          scroll: false,
        });
      });
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  function toggle(key: Group["key"], value: string) {
    startTransition(() => {
      const next = new URLSearchParams(params);
      const current = next.get(key);
      if (current === value) {
        next.delete(key);
      } else {
        next.set(key, value);
      }
      router.replace(next.toString() ? `?${next.toString()}` : "?", {
        scroll: false,
      });
    });
  }

  function clearAll() {
    setQ("");
    startTransition(() => {
      router.replace("?", { scroll: false });
    });
  }

  const anyActive = GROUPS.some((g) => params.get(g.key)) || q.trim().length > 0;

  return (
    <div className={cn("space-y-5", pending && "opacity-70")}>
      <div className="space-y-2">
        <p className="eyebrow">Search</p>
        <div className="relative">
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Mission, offers, region…"
            className="h-10 w-full rounded-full border border-border bg-white pl-9 pr-3 text-sm text-ink placeholder:text-muted/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {GROUPS.map((group) => (
        <div key={group.key} className="space-y-2">
          <p className="eyebrow">{group.label}</p>
          <div className="flex flex-wrap gap-2">
            {group.options.map((o) => {
              const active = params.get(group.key) === o.value;
              return (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => toggle(group.key, o.value)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs transition-colors duration-200",
                    active
                      ? "border-primary bg-primary text-white"
                      : "border-border bg-white text-ink hover:border-primary/40",
                  )}
                  aria-pressed={active}
                >
                  {o.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      {anyActive ? (
        <button
          type="button"
          onClick={clearAll}
          className="text-xs text-primary underline-offset-4 hover:underline"
        >
          Clear all
        </button>
      ) : null}
    </div>
  );
}
