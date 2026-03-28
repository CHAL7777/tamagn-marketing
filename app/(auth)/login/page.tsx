import { LoginForm } from "@/components/auth/LoginForm";
import { isSafeInternalPath } from "@/lib/validations/auth";

type Props = { searchParams: Promise<{ next?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const { next } = await searchParams;
  const raw = next?.trim() ?? "";
  const nextPath = raw && isSafeInternalPath(raw) ? raw : "/";
  return <LoginForm nextPath={nextPath} />;
}
