"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { signInWithEmail } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";

type Props = { nextPath?: string };

export function LoginForm({ nextPath = "/" }: Props) {
  const [state, formAction, pending] = useActionState(signInWithEmail, null);

  return (
    <div>
      <span className="tamagn-chip bg-primary-fixed text-on-primary-fixed">
        <ShieldCheck className="size-4" />
        Secure account access
      </span>
      <h1 className="mt-6 text-4xl font-extrabold tracking-[-0.06em]">
        Welcome back
      </h1>
      <p className="mt-3 text-sm leading-7 text-secondary">
        Sign in with the email tied to your buyer, merchant, service-provider,
        courier, or admin profile.
      </p>
      <form className="mt-8 space-y-5" action={formAction}>
        <input type="hidden" name="next" value={nextPath} />
        {state?.error ? (
          <p className="rounded-[1.25rem] bg-error-container px-4 py-3 text-sm text-destructive">
            {state.error}
          </p>
        ) : null}
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
            autoComplete="current-password"
            className="tamagn-field"
          />
        </div>
        <Button type="submit" className="w-full" size="lg" disabled={pending}>
          {pending ? "Signing in…" : "Sign in"}
          {!pending ? <ArrowRight className="size-4" /> : null}
        </Button>
      </form>
      <p className="mt-8 text-center text-sm text-secondary">
        No account?{" "}
        <Link href="/signup" className="font-semibold text-primary underline-offset-4 hover:underline">
          Create one
        </Link>
      </p>
    </div>
  );
}
