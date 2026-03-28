"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button-variants";

type NavLink = {
  href: string;
  label: string;
};

type Props = {
  links: NavLink[];
  openLabel: string;
  closeLabel: string;
  navigateLabel: string;
};

export function MobileNav({
  links,
  openLabel,
  closeLabel,
  navigateLabel,
}: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        aria-label={open ? closeLabel : openLabel}
        onClick={() => setOpen((o) => !o)}
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>

      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[60] bg-foreground/20 backdrop-blur-sm"
            aria-label={closeLabel}
            onClick={() => setOpen(false)}
          />
          <nav
            id="mobile-nav-panel"
            className="fixed right-0 top-0 z-[70] flex h-full w-[min(100%,18.5rem)] flex-col gap-1 border-l border-border bg-surface-container-lowest px-5 pb-8 pt-24 shadow-[var(--ambient-shadow)]"
          >
            <p className="section-kicker px-3 pb-2">{navigateLabel}</p>
            {links.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="rounded-2xl px-4 py-3.5 text-base font-semibold text-foreground transition hover:bg-surface-container-low"
                onClick={() => setOpen(false)}
              >
                {label}
              </Link>
            ))}
          </nav>
        </>
      ) : null}
    </div>
  );
}
