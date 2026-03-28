import { LoginForm } from "@/components/auth/LoginForm";
import { getCurrentLocale } from "@/lib/i18n/server";
import { getDictionary } from "@/lib/i18n/translations";
import { isSafeInternalPath } from "@/lib/validations/auth";

type Props = { searchParams: Promise<{ next?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const locale = await getCurrentLocale();
  const dictionary = getDictionary(locale);
  const { next } = await searchParams;
  const raw = next?.trim() ?? "";
  const nextPath = raw && isSafeInternalPath(raw) ? raw : "/";
  return (
    <LoginForm
      nextPath={nextPath}
      labels={dictionary.login}
      demoHintLabels={dictionary.demoHint}
    />
  );
}
