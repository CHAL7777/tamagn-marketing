"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ArrowRight, BadgeCheck } from "lucide-react";
import { signUpWithEmail } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";

export function SignupForm() {
  const [state, formAction, pending] = useActionState(signUpWithEmail, null);

  return (
    <div>
      <span className="tamagn-chip bg-surface-container-low text-secondary">
        <BadgeCheck className="size-4 text-primary" />
        Buyer onboarding
      </span>
      <h1 className="mt-6 text-4xl font-extrabold tracking-[-0.06em]">
        Create your Tamagn account
      </h1>
      <p className="mt-3 text-sm leading-7 text-secondary">
        Buyer accounts start here. Merchant and service-provider access is
        granted after approval inside the platform.
      </p>
      <form className="mt-8 space-y-5" action={formAction}>
        {state?.error ? (
          <p
            className={`rounded-[1.25rem] px-4 py-3 text-sm ${
              state.ok
                ? "bg-surface-container-low text-foreground"
                : "bg-error-container text-destructive"
            }`}
          >
            {state.error}
          </p>
        ) : null}
        {state?.ok && !state.error ? (
          <p className="rounded-[1.25rem] bg-surface-container-low px-4 py-3 text-sm">
            Application received. You can sign in after email confirmation.
          </p>
        ) : null}
        <div className="space-y-2">
          <label htmlFor="full_name" className="text-[11px] font-bold uppercase tracking-[0.18em] text-secondary">
            Full name
          </label>
          <input
            id="full_name"
            name="full_name"
            type="text"
            autoComplete="name"
            className="tamagn-field"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="email" className="text-[11px] font-bold uppercase tracking-[0.18em] text-secondary">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="tamagn-field"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="password" className="text-[11px] font-bold uppercase tracking-[0.18em] text-secondary">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            className="tamagn-field"
          />
        </div>
        <Button type="submit" className="w-full" size="lg" disabled={pending}>
          {pending ? "Creating…" : "Create account"}
          {!pending ? <ArrowRight className="size-4" /> : null}
        </Button>
      </form>
      <p className="mt-8 text-center text-sm text-secondary">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-primary underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
