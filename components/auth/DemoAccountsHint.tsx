"use client";

import Link from "next/link";
import { UserCircle } from "lucide-react";
import { MaterialIconImage } from "@/components/marketing/MaterialIconImage";

const DEFAULT_DEMO_PASSWORD = "TamagnDemo123!";

type Props = {
  labels: {
    summary: string;
    intro: string;
    stepSeed: string;
    stepLogin: string;
    roles: string;
  };
};

function shouldShow(): boolean {
  if (process.env.NEXT_PUBLIC_SHOW_DEMO_ACCOUNTS === "true") return true;
  if (process.env.NEXT_PUBLIC_SHOW_DEMO_ACCOUNTS === "false") return false;
  return process.env.NODE_ENV === "development";
}

export function DemoAccountsHint({ labels }: Props) {
  if (!shouldShow()) return null;

  return (
    <details className="mt-6 rounded-[1.25rem] border border-primary/20 bg-primary/5 px-4 py-3 text-left">
      <summary className="cursor-pointer list-none font-semibold text-foreground [&::-webkit-details-marker]:hidden">
        <span className="inline-flex items-center gap-2">
          <UserCircle className="size-4 text-primary" />
          {labels.summary}
        </span>
      </summary>
      <div className="mt-3 space-y-3 text-sm leading-6 text-secondary">
        <div
          className="flex flex-wrap items-center justify-center gap-4 rounded-2xl bg-surface-container-low/80 py-4"
          aria-hidden
        >
          <MaterialIconImage icon="terminal" alt="" size={48} className="opacity-80" />
          <MaterialIconImage icon="person" alt="" size={48} className="opacity-80" />
          <MaterialIconImage icon="shoppingCart" alt="" size={48} className="opacity-80" />
        </div>
        <p>{labels.intro}</p>
        <ol className="list-decimal space-y-1 pl-5">
          <li>{labels.stepSeed}</li>
          <li>
            <Link href="/login" className="font-semibold text-primary underline-offset-2 hover:underline">
              /login
            </Link>
            <span className="ml-1">{labels.stepLogin}</span>
          </li>
        </ol>
        <p className="text-xs">
          {labels.roles}
        </p>
        <p className="text-xs text-foreground">
          <code className="text-foreground">buyer@tamagn.demo</code> /{" "}
          <code className="text-foreground">{DEFAULT_DEMO_PASSWORD}</code>
        </p>
      </div>
    </details>
  );
}
