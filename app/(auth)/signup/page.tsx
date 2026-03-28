import { SignupForm } from "@/components/auth/SignupForm";
import { isSafeInternalPath } from "@/lib/validations/auth";

type Props = { searchParams: Promise<{ next?: string }> };

export default async function SignupPage({ searchParams }: Props) {
  const { next } = await searchParams;
  const raw = next?.trim() ?? "";
  const nextPath = raw && isSafeInternalPath(raw) ? raw : "/";
  return <SignupForm nextPath={nextPath} />;
}
