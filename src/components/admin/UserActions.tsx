"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type Action =
  | "ban"
  | "unban"
  | "reset_flags"
  | "delete"
  | "grant_admin"
  | "revoke_admin"
  | "approve"
  | "reject"
  | "reset_approval";

type UserActionsProps = {
  userId: string;
  alias: string;
  status: "active" | "suspended" | "deleted";
  isAdmin: boolean;
  approvalStatus: "pending" | "approved" | "rejected";
};

export function UserActions({
  userId,
  alias,
  status,
  isAdmin,
  approvalStatus,
}: UserActionsProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(action: Action) {
    setError(null);
    startTransition(async () => {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(body?.error ?? "Action failed.");
        return;
      }
      if (action === "delete") {
        router.push("/admin/users");
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {approvalStatus === "pending" ? (
          <>
            <button
              type="button"
              onClick={() => run("approve")}
              disabled={pending}
              className="rounded-full bg-success px-4 py-2 text-xs font-medium text-white transition active:scale-[0.98] disabled:opacity-50"
            >
              Approve
            </button>
            <button
              type="button"
              onClick={() => run("reject")}
              disabled={pending}
              className="rounded-full border border-error/40 bg-white px-4 py-2 text-xs font-medium text-error transition hover:bg-error/10 disabled:opacity-50"
            >
              Reject
            </button>
          </>
        ) : approvalStatus === "rejected" ? (
          <>
            <button
              type="button"
              onClick={() => run("approve")}
              disabled={pending}
              className="rounded-full bg-success px-4 py-2 text-xs font-medium text-white transition active:scale-[0.98] disabled:opacity-50"
            >
              Approve anyway
            </button>
            <button
              type="button"
              onClick={() => run("reset_approval")}
              disabled={pending}
              className="rounded-full border border-border bg-white px-4 py-2 text-xs font-medium text-ink transition hover:border-primary/40 disabled:opacity-50"
            >
              Reset to pending
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => run("reset_approval")}
            disabled={pending}
            className="rounded-full border border-warning/40 bg-warning/5 px-4 py-2 text-xs font-medium text-warning transition hover:bg-warning/10 disabled:opacity-50"
          >
            Un-approve
          </button>
        )}

        <span className="h-5 w-px bg-border" aria-hidden="true" />

        {status !== "suspended" ? (
          <button
            type="button"
            onClick={() => run("ban")}
            disabled={pending}
            className="rounded-full bg-warning px-4 py-2 text-xs font-medium text-white transition active:scale-[0.98] disabled:opacity-50"
          >
            Suspend
          </button>
        ) : (
          <button
            type="button"
            onClick={() => run("unban")}
            disabled={pending}
            className="rounded-full bg-success px-4 py-2 text-xs font-medium text-white transition active:scale-[0.98] disabled:opacity-50"
          >
            Reinstate
          </button>
        )}

        <button
          type="button"
          onClick={() => run("reset_flags")}
          disabled={pending}
          className="rounded-full border border-border bg-white px-4 py-2 text-xs font-medium text-ink transition hover:border-primary/40 disabled:opacity-50"
        >
          Reset flag count
        </button>

        {isAdmin ? (
          <button
            type="button"
            onClick={() => run("revoke_admin")}
            disabled={pending}
            className="rounded-full border border-warning/40 bg-warning/10 px-4 py-2 text-xs font-medium text-warning transition hover:bg-warning/15 disabled:opacity-50"
          >
            Revoke admin
          </button>
        ) : (
          <button
            type="button"
            onClick={() => run("grant_admin")}
            disabled={pending}
            className="rounded-full bg-primary px-4 py-2 text-xs font-medium text-white transition hover:bg-primary-hover active:scale-[0.98] disabled:opacity-50"
          >
            Make admin
          </button>
        )}

        {!confirmDelete ? (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            disabled={pending}
            className="rounded-full border border-error/40 bg-white px-4 py-2 text-xs font-medium text-error transition hover:bg-error/10 disabled:opacity-50"
          >
            Delete…
          </button>
        ) : (
          <span className="flex flex-wrap items-center gap-2 rounded-full border border-error/40 bg-error/5 px-3 py-1 text-xs text-error">
            Delete {alias}?
            <button
              type="button"
              onClick={() => run("delete")}
              disabled={pending}
              className="rounded-full bg-error px-3 py-1 text-[11px] font-medium text-white"
            >
              {pending ? "Deleting…" : "Confirm"}
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              disabled={pending}
              className="text-[11px] text-muted hover:text-ink"
            >
              Cancel
            </button>
          </span>
        )}
      </div>

      {error ? (
        <p className="rounded-[10px] bg-error/10 px-3 py-2 text-xs text-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}
