import { SignupForm } from "@/components/auth/SignupForm";
import { getCurrentLocale } from "@/lib/i18n/server";
import { getDictionary } from "@/lib/i18n/translations";
import { isSafeInternalPath } from "@/lib/validations/auth";

type Props = { searchParams: Promise<{ next?: string }> };

export default async function SignupPage({ searchParams }: Props) {
  const locale = await getCurrentLocale();
  const dictionary = getDictionary(locale);
  const { next } = await searchParams;
  const raw = next?.trim() ?? "";
  const nextPath = raw && isSafeInternalPath(raw) ? raw : "/";
  return (
    <SignupForm
      nextPath={nextPath}
      labels={dictionary.signup}
      demoHintLabels={dictionary.demoHint}
      loginLabel={dictionary.login.signIn}
    />
  );
}
