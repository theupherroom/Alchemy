"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { FieldError } from "@/components/ui/FieldError";
import { loginAction, type AuthFormState } from "./actions";

const initialState: AuthFormState = {};

export function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="next" value={next} />

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

      <Label htmlFor="password">
        Password
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          minLength={8}
        />
      </Label>

      <FieldError message={state.error} />

      <Button type="submit" loading={pending} fullWidth size="lg">
        Sign in
      </Button>
    </form>
  );
}
