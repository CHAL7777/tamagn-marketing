import { cookies } from "next/headers";
import {
  getDictionary,
  isLocale,
  isThemeMode,
  LOCALE_COOKIE_NAME,
  THEME_COOKIE_NAME,
  type Locale,
  type ThemeMode,
} from "@/lib/i18n/translations";

export async function getCurrentLocale(): Promise<Locale> {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE_NAME)?.value;
  return isLocale(value) ? value : "en";
}

export async function getCurrentTheme(): Promise<ThemeMode> {
  const store = await cookies();
  const value = store.get(THEME_COOKIE_NAME)?.value;
  return isThemeMode(value) ? value : "dark";
}

export async function getCurrentDictionary() {
  return getDictionary(await getCurrentLocale());
}
