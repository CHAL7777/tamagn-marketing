import { LoginForm } from "@/components/auth/LoginForm";

type Props = { searchParams: Promise<{ next?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const { next } = await searchParams;
  return <LoginForm nextPath={next ?? "/"} />;
}
