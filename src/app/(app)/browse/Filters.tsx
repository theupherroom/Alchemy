"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
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

export function Filters() {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

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
    startTransition(() => {
      router.replace("?", { scroll: false });
    });
  }

  const anyActive = GROUPS.some((g) => params.get(g.key));

  return (
    <div className={cn("space-y-4", pending && "opacity-70")}>
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
          Clear all filters
        </button>
      ) : null}
    </div>
  );
}
