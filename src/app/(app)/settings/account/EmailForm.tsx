"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { FieldError } from "@/components/ui/FieldError";
import { updateEmailAction, type AccountActionState } from "./actions";

const initialState: AccountActionState = {};

export function EmailForm({ currentEmail }: { currentEmail: string }) {
  const [state, formAction, pending] = useActionState(
    updateEmailAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-4">
      <Label htmlFor="account-email">
        New email
        <Input
          id="account-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          defaultValue={currentEmail}
        />
      </Label>
      <FieldError message={state.error} />
      {state.ok ? (
        <p className="rounded-[10px] bg-success/10 px-3 py-2 text-xs text-success">
          {state.ok}
        </p>
      ) : null}
      <Button type="submit" loading={pending}>
        Send confirmation
      </Button>
    </form>
  );
}
