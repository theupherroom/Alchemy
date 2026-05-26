"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { FieldError } from "@/components/ui/FieldError";
import { signupAction, type AuthFormState } from "./actions";

const initialState: AuthFormState = {};

export function SignupForm() {
  const [state, formAction, pending] = useActionState(signupAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <Label htmlFor="email">
        Email
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@org.com"
        />
      </Label>

      <Label htmlFor="password" hint="At least 8 characters">
        Password
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
        />
      </Label>

      <FieldError message={state.error} />

      <Button type="submit" loading={pending} fullWidth size="lg">
        Create account
      </Button>

      <p className="text-xs leading-relaxed text-muted">
        By continuing you agree to keep aliases anonymous, treat fellow members
        with respect, and meet in good faith. Three flags lead to suspension.
      </p>
    </form>
  );
}
