"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ArrowRight, Mail, ShieldCheck } from "lucide-react";
import {
  resendSignupConfirmation,
  signInWithEmail,
} from "@/app/actions/auth";
import { DemoAccountsHint } from "@/components/auth/DemoAccountsHint";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

type Props = {
  nextPath?: string;
  labels: {
    badge: string;
    title: string;
    body: string;
    email: string;
    password: string;
    signIn: string;
    signingIn: string;
    noAccount: string;
    createOne: string;
    resendHint: string;
    resendEmail: string;
    sending: string;
    resendConfirmation: string;
  };
  demoHintLabels: {
    summary: string;
    intro: string;
    stepSeed: string;
    stepLogin: string;
    roles: string;
  };
};

export function LoginForm({
  nextPath = "/",
  labels,
  demoHintLabels,
}: Props) {
  const [signInState, signInAction, signInPending] = useActionState(
    signInWithEmail,
    null
  );
  const [resendState, resendAction, resendPending] = useActionState(
    resendSignupConfirmation,
    null
  );

  const resendEmail =
    signInState?.resendForEmail ?? "";

  return (
    <div>
      <span className="tamagn-chip bg-primary-fixed text-on-primary-fixed">
        <ShieldCheck className="size-4" />
        {labels.badge}
      </span>
      <h1 className="mt-6 font-headline text-4xl font-extrabold tracking-[-0.06em]">
        {labels.title}
      </h1>
      <p className="mt-3 text-sm leading-7 text-secondary">
        {labels.body}
      </p>
      <DemoAccountsHint labels={demoHintLabels} />

      {resendState?.ok && resendState.info ? (
        <p
          role="status"
          className="mt-6 rounded-[1.25rem] bg-surface-container-low px-4 py-3 text-sm leading-7 text-foreground"
        >
          {resendState.info}
        </p>
      ) : null}

      <form className="mt-8 space-y-5" action={signInAction}>
        <input type="hidden" name="next" value={nextPath} />
        {signInState?.error && !resendState?.ok ? (
          <p
            role="alert"
            className="rounded-[1.25rem] bg-error-container px-4 py-3 text-sm text-destructive"
          >
            {signInState.error}
          </p>
        ) : null}
        <div className="space-y-2">
          <label htmlFor="email" className="text-[11px] font-bold uppercase tracking-[0.18em] text-secondary">
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
            defaultValue={resendEmail}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="password" className="text-[11px] font-bold uppercase tracking-[0.18em] text-secondary">
            {labels.password}
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="tamagn-field"
            placeholder="••••••••"
          />
        </div>
        <Button type="submit" className="w-full" size="lg" disabled={signInPending}>
          {signInPending ? labels.signingIn : labels.signIn}
          {!signInPending ? <ArrowRight className="size-4" /> : null}
        </Button>
      </form>

      {resendEmail ? (
        <form className="mt-4 space-y-3" action={resendAction}>
          <input type="hidden" name="next" value={nextPath} />
          <p className="text-xs leading-5 text-secondary">
            {labels.resendHint}
          </p>
          <label className="sr-only" htmlFor="resend-email">
            {labels.resendEmail}
          </label>
          <input
            id="resend-email"
            name="email"
            type="email"
            required
            defaultValue={resendEmail}
            autoComplete="email"
            className="tamagn-field text-sm"
          />
          <button
            type="submit"
            disabled={resendPending}
            className={cn(
              buttonVariants({ variant: "outline", size: "default" }),
              "w-full"
            )}
          >
            <Mail className="size-4" />
            {resendPending ? labels.sending : labels.resendConfirmation}
          </button>
          {resendState?.error ? (
            <p role="alert" className="text-sm text-destructive">
              {resendState.error}
            </p>
          ) : null}
        </form>
      ) : null}

      <p className="mt-8 text-center text-sm text-secondary">
        {labels.noAccount}{" "}
        <Link
          href={
            nextPath && nextPath !== "/"
              ? `/signup?next=${encodeURIComponent(nextPath)}`
              : "/signup"
          }
          className="font-semibold text-primary underline-offset-4 hover:underline"
        >
          {labels.createOne}
        </Link>
      </p>
    </div>
  );
}
