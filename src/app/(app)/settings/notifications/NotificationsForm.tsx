"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import {
  updateNotificationPrefs,
  type NotificationsState,
} from "./actions";

type Defaults = {
  notify_match_request: boolean;
  notify_match_accepted: boolean;
  notify_meeting_scheduled: boolean;
  notify_weekly_digest: boolean;
};

const ROWS: {
  key: keyof Defaults;
  title: string;
  body: string;
}[] = [
  {
    key: "notify_match_request",
    title: "When someone requests to connect",
    body: "An email when another member sends you a match request.",
  },
  {
    key: "notify_match_accepted",
    title: "When a request is accepted",
    body: "An email when someone accepts your request — plus the intro email with your meeting time.",
  },
  {
    key: "notify_meeting_scheduled",
    title: "When a meeting is scheduled",
    body: "An email confirming the booked time and Google Meet link.",
  },
  {
    key: "notify_weekly_digest",
    title: "Weekly digest",
    body: "A short email every Monday with your top suggestions for the week.",
  },
];

const initialState: NotificationsState = {};

export function NotificationsForm({ defaults }: { defaults: Defaults }) {
  const [state, formAction, pending] = useActionState(
    updateNotificationPrefs,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-6">
      <ul className="divide-y divide-border">
        {ROWS.map((row) => (
          <li key={row.key} className="flex items-start justify-between gap-6 py-5">
            <div className="space-y-1">
              <p className="text-sm font-medium text-ink">{row.title}</p>
              <p className="max-w-md text-xs leading-relaxed text-muted">
                {row.body}
              </p>
            </div>
            <label className="relative inline-flex flex-shrink-0 cursor-pointer items-center">
              <input
                type="checkbox"
                name={row.key}
                defaultChecked={defaults[row.key]}
                className="peer sr-only"
              />
              <span
                aria-hidden="true"
                className="h-6 w-11 rounded-full bg-cream-deep transition-colors duration-200 peer-checked:bg-primary"
              />
              <span
                aria-hidden="true"
                className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] peer-checked:translate-x-5"
              />
            </label>
          </li>
        ))}
      </ul>

      {state.error ? (
        <p className="rounded-[10px] bg-error/10 px-3 py-2 text-xs text-error">
          {state.error}
        </p>
      ) : null}
      {state.ok ? (
        <p className="rounded-[10px] bg-success/10 px-3 py-2 text-xs text-success">
          {state.ok}
        </p>
      ) : null}

      <Button type="submit" loading={pending}>
        Save preferences
      </Button>
    </form>
  );
}
