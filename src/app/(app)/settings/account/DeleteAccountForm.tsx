"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { deleteAccountAction } from "./actions";

export function DeleteAccountForm() {
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await deleteAccountAction(formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <form action={submit} className="space-y-4">
      <Label htmlFor="delete-confirm">
        Type{" "}
        <span className="alias-code rounded bg-cream-deep px-1.5 py-0.5">
          DELETE
        </span>{" "}
        to confirm
        <Input
          id="delete-confirm"
          name="confirm"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          autoComplete="off"
          required
          placeholder="DELETE"
        />
      </Label>

      {error ? (
        <p className="rounded-input bg-error/10 px-3 py-2 text-xs text-error">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending || confirm !== "DELETE"}
        className="inline-flex h-11 items-center rounded-full bg-error px-6 text-sm font-medium text-white transition-opacity active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "Deleting…" : "Delete account permanently"}
      </button>
    </form>
  );
}
