"use server";

import { cookies } from "next/headers";
import {
  isLocale,
  isThemeMode,
  LOCALE_COOKIE_NAME,
  THEME_COOKIE_NAME,
} from "@/lib/i18n/translations";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export async function setLocalePreference(locale: string) {
  if (!isLocale(locale)) {
    throw new Error("Unsupported locale");
  }

  const store = await cookies();
  store.set(LOCALE_COOKIE_NAME, locale, {
    path: "/",
    maxAge: ONE_YEAR_SECONDS,
    sameSite: "lax",
  });
}

export async function setThemePreference(theme: string) {
  if (!isThemeMode(theme)) {
    throw new Error("Unsupported theme");
  }

  const store = await cookies();
  store.set(THEME_COOKIE_NAME, theme, {
    path: "/",
    maxAge: ONE_YEAR_SECONDS,
    sameSite: "lax",
  });
}
