"use client";

import { useActionState, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { FieldError } from "@/components/ui/FieldError";
import { updatePasswordAction, type AccountActionState } from "./actions";

const initialState: AccountActionState = {};

export function PasswordForm() {
  const [state, formAction, pending] = useActionState(
    updatePasswordAction,
    initialState,
  );
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (data) => {
        await formAction(data);
        formRef.current?.reset();
      }}
      className="space-y-4"
    >
      <Label htmlFor="new-password" hint="At least 8 characters">
        New password
        <Input
          id="new-password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
        />
      </Label>
      <Label htmlFor="confirm-password">
        Confirm new password
        <Input
          id="confirm-password"
          name="confirm"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
        />
      </Label>
      <FieldError message={state.error} />
      {state.ok ? (
        <p className="rounded-input bg-success/10 px-3 py-2 text-xs text-success">
          {state.ok}
        </p>
      ) : null}
      <Button type="submit" loading={pending}>
        Update password
      </Button>
    </form>
  );
}
