"use client";

import { useTransition } from "react";
import { MoonStar, SunMedium } from "lucide-react";
import { useRouter } from "next/navigation";
import { setThemePreference } from "@/app/actions/preferences";
import type { ThemeMode } from "@/lib/i18n/translations";

type Props = {
  theme: ThemeMode;
  labels: Record<ThemeMode, string>;
  names: Record<ThemeMode, string>;
};

export function ThemeToggle({ theme, labels, names }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const nextTheme = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      disabled={pending}
      aria-label={labels[theme]}
      className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-surface-container-low px-3 py-2 text-sm font-semibold text-secondary transition hover:bg-surface-container-highest"
      onClick={() => {
        startTransition(async () => {
          await setThemePreference(nextTheme);
          router.refresh();
        });
      }}
    >
      {theme === "dark" ? (
        <MoonStar className="size-4 text-primary" />
      ) : (
        <SunMedium className="size-4 text-primary" />
      )}
      <span className="hidden sm:inline">{names[nextTheme]}</span>
    </button>
  );
}
