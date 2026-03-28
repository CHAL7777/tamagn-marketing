"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signUpWithEmail, type AuthFormState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";

export function SignupForm() {
  const [state, formAction, pending] = useActionState(signUpWithEmail, null);

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Create account</h1>
      <p className="mt-1 text-sm text-muted-foreground">Join as a buyer</p>
      <form className="mt-8 space-y-4" action={formAction}>
        {state?.error ? (
          <p
            className={`rounded-md px-3 py-2 text-sm ${
              state.ok
                ? "bg-muted text-foreground"
                : "bg-destructive/10 text-destructive"
            }`}
          >
            {state.error}
          </p>
        ) : null}
        {state?.ok && !state.error ? (
          <p className="rounded-md bg-muted px-3 py-2 text-sm">
            Application received. You can sign in after email confirmation.
          </p>
        ) : null}
        <div className="space-y-2">
          <label htmlFor="full_name" className="text-sm font-medium">
            Full name
          </label>
          <input
            id="full_name"
            name="full_name"
            type="text"
            autoComplete="name"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Creating…" : "Sign up"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
