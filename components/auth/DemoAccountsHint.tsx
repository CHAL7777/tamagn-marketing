"use client";

import Link from "next/link";
import { Terminal, UserCircle } from "lucide-react";

const DEFAULT_DEMO_PASSWORD = "TamagnDemo123!";

function shouldShow(): boolean {
  if (process.env.NEXT_PUBLIC_SHOW_DEMO_ACCOUNTS === "true") return true;
  if (process.env.NEXT_PUBLIC_SHOW_DEMO_ACCOUNTS === "false") return false;
  return process.env.NODE_ENV === "development";
}

export function DemoAccountsHint() {
  if (!shouldShow()) return null;

  return (
    <details className="mt-6 rounded-[1.25rem] border border-primary/20 bg-primary/5 px-4 py-3 text-left">
      <summary className="cursor-pointer list-none font-semibold text-foreground [&::-webkit-details-marker]:hidden">
        <span className="inline-flex items-center gap-2">
          <UserCircle className="size-4 text-primary" />
          Local demo (skip signup emails)
        </span>
      </summary>
      <div className="mt-3 space-y-3 text-sm leading-6 text-secondary">
        <p>
          If signup hits <strong className="text-foreground">email rate limit</strong> or you
          don&apos;t want confirmation mail, seed demo users once, then sign in:
        </p>
        <ol className="list-decimal space-y-1 pl-5">
          <li>
            From the project root, run{" "}
            <code className="rounded-md bg-surface-container-high px-1.5 py-0.5 text-xs text-foreground">
              npm run seed:demo
            </code>{" "}
            (needs <code className="text-xs">SUPABASE_SERVICE_ROLE_KEY</code> in{" "}
            <code className="text-xs">.env.local</code>).
          </li>
          <li>
            Sign in on{" "}
            <Link href="/login" className="font-semibold text-primary underline-offset-2 hover:underline">
              Login
            </Link>{" "}
            with e.g.{" "}
            <code className="text-xs text-foreground">buyer@tamagn.demo</code> / password from{" "}
            <code className="text-xs">DEMO_USER_PASSWORD</code> or{" "}
            <code className="text-xs text-foreground">{DEFAULT_DEMO_PASSWORD}</code>.
          </li>
        </ol>
        <p className="flex items-start gap-2 text-xs">
          <Terminal className="mt-0.5 size-3.5 shrink-0" />
          Other roles: <code className="text-foreground">admin@tamagn.demo</code>,{" "}
          <code className="text-foreground">merchant@tamagn.demo</code>,{" "}
          <code className="text-foreground">courier@tamagn.demo</code>,{" "}
          <code className="text-foreground">provider@tamagn.demo</code>. See{" "}
          <code className="text-foreground">supabase/README.md</code>.
        </p>
      </div>
    </details>
  );
}
