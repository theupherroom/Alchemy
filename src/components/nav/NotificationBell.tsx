"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";

type Notification = {
  id: string;
  kind:
    | "match_request"
    | "match_accepted"
    | "match_declined"
    | "meeting_scheduled"
    | "flag_warning"
    | "flag_final_warning"
    | "calendar_disconnected";
  match_id: string | null;
  read_at: string | null;
  created_at: string;
};

const LABELS: Record<Notification["kind"], string> = {
  match_request: "Someone requested to connect",
  match_accepted: "Your request was accepted",
  match_declined: "Your request was declined",
  meeting_scheduled: "Intro meeting scheduled",
  flag_warning: "Heads up — you were flagged",
  flag_final_warning: "Final warning — one more flag suspends your account",
  calendar_disconnected: "Calendar disconnected — reconnect to enable scheduling",
};

const LINKS: Record<Notification["kind"], string> = {
  match_request: "/matches",
  match_accepted: "/matches",
  match_declined: "/matches",
  meeting_scheduled: "/matches",
  flag_warning: "/profile",
  flag_final_warning: "/profile",
  calendar_disconnected: "/settings/calendar",
};

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  async function refresh() {
    try {
      const res = await fetch("/api/notifications", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as {
        notifications: Notification[];
        unread: number;
      };
      setItems(data.notifications);
      setUnread(data.unread);
    } catch {
      // silent
    }
  }

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 60_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  async function markRead() {
    if (unread === 0) return;
    setUnread(0);
    setItems((prev) =>
      prev.map((n) =>
        n.read_at ? n : { ...n, read_at: new Date().toISOString() },
      ),
    );
    await fetch("/api/notifications", { method: "POST", body: "{}" });
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => {
          setOpen((o) => !o);
          if (!open) markRead();
        }}
        className="relative flex h-9 w-9 items-center justify-center rounded-full transition-colors duration-200 hover:bg-primary-bg/60"
        aria-label="Notifications"
      >
        <svg
          className="h-4 w-4 text-muted"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        {unread > 0 ? (
          <span className="absolute right-1 top-1 inline-block h-2 w-2 rounded-full bg-error" />
        ) : null}
      </button>
      {open ? (
        <div className="absolute right-0 z-50 mt-2 w-80 origin-top-right overflow-hidden rounded-2xl border border-border bg-white shadow-elev-lg">
          <div className="border-b border-border px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted">
              Notifications
            </p>
          </div>
          {items.length === 0 ? (
            <p className="px-4 py-8 text-center text-xs text-muted">
              Nothing new yet.
            </p>
          ) : (
            <ul className="max-h-96 divide-y divide-border overflow-y-auto">
              {items.map((n) => (
                <li key={n.id}>
                  <Link
                    href={LINKS[n.kind]}
                    onClick={() => setOpen(false)}
                    className="block px-4 py-3 transition-colors duration-200 hover:bg-cream"
                  >
                    <p className="text-sm text-ink">{LABELS[n.kind]}</p>
                    <p className="mt-0.5 text-[11px] text-muted">
                      {timeAgo(n.created_at)}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const s = Math.round(ms / 1000);
  if (s < 60) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return `${d}d ago`;
}
