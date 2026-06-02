"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { cn } from "@/lib/cn";
import { formatAlias } from "@/lib/alias/display";

type MobileNavProps = {
  alias?: string | null;
  links: { href: string; label: string }[];
};

// Hamburger that morphs to X, full-screen sheet with staggered link reveal.
// Bottom-anchored sign-out form. Closes on link tap, route change, Escape.

export function MobileNav({ alias, links }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-200 hover:bg-primary-bg/60 md:hidden"
        aria-label="Open menu"
        aria-expanded={open}
      >
        <svg
          className="h-5 w-5 text-ink"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        >
          <path d="M4 8h16M4 16h16" />
        </svg>
      </button>

      <div
        className={cn(
          "fixed inset-0 z-[70] bg-cream/95 backdrop-blur-xl transition-opacity duration-300 md:hidden",
          open
            ? "opacity-100"
            : "pointer-events-none opacity-0",
        )}
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
      >
        <div className="absolute inset-0 flex flex-col">
          <div className="container-site flex h-16 items-center justify-between">
            <span className="display text-xl text-ink">alchemy</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-200 hover:bg-primary-bg/60"
              aria-label="Close menu"
            >
              <svg
                className="h-5 w-5 text-ink"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              >
                <path d="M6 6l12 12M6 18L18 6" />
              </svg>
            </button>
          </div>

          <nav className="container-site flex flex-1 flex-col justify-between py-10">
            <ul className="space-y-3">
              {links.map((link, i) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "block py-3 transition-[transform,opacity,filter] duration-[700ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
                      open
                        ? "translate-y-0 opacity-100 blur-0"
                        : "translate-y-4 opacity-0 blur-[2px]",
                    )}
                    style={{
                      transitionDelay: open ? `${80 + i * 60}ms` : "0ms",
                    }}
                  >
                    <span className="display text-4xl leading-tight text-ink">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>

            <div className="space-y-6">
              {alias ? (
                <div className="rounded-2xl border border-border bg-white px-5 py-4">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted">
                    You are
                  </p>
                  <p className="alias-code mt-1 text-lg text-primary-fg">
                    {formatAlias(alias)}
                  </p>
                </div>
              ) : null}

              <div className="flex items-center justify-between gap-4">
                <Link
                  href="/settings/calendar"
                  onClick={() => setOpen(false)}
                  className="text-sm text-muted hover:text-ink"
                >
                  Calendar settings
                </Link>
                <form action="/auth/logout" method="post">
                  <button
                    type="submit"
                    className="rounded-full border border-border bg-white px-4 py-2 text-xs text-muted transition-colors hover:text-ink"
                  >
                    Sign out
                  </button>
                </form>
              </div>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}
