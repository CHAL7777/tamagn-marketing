"use client";

import { useTransition } from "react";
import { Globe2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { setLocalePreference } from "@/app/actions/preferences";
import type { Locale } from "@/lib/i18n/translations";

type Props = {
  locale: Locale;
  localeNames: Record<Locale, string>;
  switchLanguageLabel: string;
  compact?: boolean;
};

export function LanguageSwitcher({
  locale,
  localeNames,
  switchLanguageLabel,
  compact = false,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <label
      className={`inline-flex items-center gap-2 rounded-full border border-border/70 bg-surface-container-low px-3 py-2 text-secondary ${
        compact ? "text-xs" : "text-sm"
      }`}
    >
      <Globe2 className="size-4 text-primary" />
      <span className="sr-only">{switchLanguageLabel}</span>
      <select
        aria-label={switchLanguageLabel}
        className="bg-transparent font-semibold outline-none"
        defaultValue={locale}
        disabled={pending}
        onChange={(event) => {
          const nextLocale = event.target.value;
          startTransition(async () => {
            await setLocalePreference(nextLocale);
            router.refresh();
          });
        }}
      >
        {Object.entries(localeNames).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </label>
  );
}
