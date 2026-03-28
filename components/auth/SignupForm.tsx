"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ArrowRight, BadgeCheck } from "lucide-react";
import { signUpWithEmail } from "@/app/actions/auth";
import { DemoAccountsHint } from "@/components/auth/DemoAccountsHint";
import { Button } from "@/components/ui/button";

type Props = {
  nextPath?: string;
  labels: {
    badge: string;
    title: string;
    body: string;
    fullName: string;
    optional: string;
    email: string;
    password: string;
    passwordHint: string;
    createAccount: string;
    creating: string;
    alreadyHaveAccount: string;
    signIn: string;
  };
  demoHintLabels: {
    summary: string;
    intro: string;
    stepSeed: string;
    stepLogin: string;
    roles: string;
  };
  loginLabel: string;
};

export function SignupForm({
  nextPath = "/",
  labels,
  demoHintLabels,
  loginLabel,
}: Props) {
  const [state, formAction, pending] = useActionState(signUpWithEmail, null);

  return (
    <div>
      <span className="tamagn-chip bg-surface-container-low text-secondary">
        <BadgeCheck className="size-4 text-primary" />
        {labels.badge}
      </span>
      <h1 className="mt-6 font-headline text-4xl font-extrabold tracking-[-0.06em]">
        {labels.title}
      </h1>
      <p className="mt-3 text-sm leading-7 text-secondary">
        {labels.body}
      </p>
      <DemoAccountsHint labels={demoHintLabels} />
      <form className="mt-8 space-y-5" action={formAction}>
        <input type="hidden" name="next" value={nextPath} />
        {state?.error ? (
          <p
            role="alert"
            className="rounded-[1.25rem] bg-error-container px-4 py-3 text-sm text-destructive"
          >
            {state.error}
          </p>
        ) : null}
        {state?.ok && state.info ? (
          <p
            role="status"
            className="rounded-[1.25rem] bg-surface-container-low px-4 py-3 text-sm leading-7 text-foreground"
          >
            {state.info}
          </p>
        ) : null}
        <div className="space-y-2">
          <label
            htmlFor="full_name"
            className="text-[11px] font-bold uppercase tracking-[0.18em] text-secondary"
          >
            {labels.fullName}{" "}
            <span className="font-normal text-muted-foreground">({labels.optional})</span>
          </label>
          <input
            id="full_name"
            name="full_name"
            type="text"
            autoComplete="name"
            className="tamagn-field"
            placeholder="e.g. Hirut Bekele"
          />
        </div>
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="text-[11px] font-bold uppercase tracking-[0.18em] text-secondary"
          >
            {labels.email}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="tamagn-field"
            placeholder="you@example.com"
          />
        </div>
        <div className="space-y-2">
          <label
            htmlFor="password"
            className="text-[11px] font-bold uppercase tracking-[0.18em] text-secondary"
          >
            {labels.password}
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            className="tamagn-field"
            placeholder="At least 6 characters"
            aria-describedby="password-hint"
          />
          <p id="password-hint" className="text-xs text-secondary">
            {labels.passwordHint}
          </p>
        </div>
        <Button type="submit" className="w-full" size="lg" disabled={pending}>
          {pending ? labels.creating : labels.createAccount}
          {!pending ? <ArrowRight className="size-4" /> : null}
        </Button>
      </form>
      <p className="mt-8 text-center text-sm text-secondary">
        {labels.alreadyHaveAccount}{" "}
        <Link
          href={
            nextPath && nextPath !== "/"
              ? `/login?next=${encodeURIComponent(nextPath)}`
              : "/login"
          }
          className="font-semibold text-primary underline-offset-4 hover:underline"
        >
          {loginLabel}
        </Link>
      </p>
    </div>
  );
}
