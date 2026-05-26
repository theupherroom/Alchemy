"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { FieldError } from "@/components/ui/FieldError";
import { magicLinkAction, type AuthFormState } from "./actions";

const initialState: AuthFormState = {};

export function MagicLinkForm() {
  const [state, formAction, pending] = useActionState(
    magicLinkAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-4">
      <Label htmlFor="magic-email">
        Email
        <Input
          id="magic-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@org.com"
        />
      </Label>
      <FieldError message={state.error} />
      {state.ok ? (
        <p className="rounded-[10px] bg-success/10 px-3 py-2 text-xs text-success">
          {state.ok}
        </p>
      ) : null}
      <Button
        type="submit"
        loading={pending}
        variant="outline"
        fullWidth
        size="lg"
      >
        Email me a magic link
      </Button>
    </form>
  );
}
