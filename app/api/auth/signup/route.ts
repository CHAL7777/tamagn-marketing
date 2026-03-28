import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { signUpSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = signUpSchema.safeParse(body);
  if (!parsed.success) {
    const fields = parsed.error.flatten().fieldErrors;
    const message =
      fields.email?.[0] ?? fields.password?.[0] ?? fields.full_name?.[0] ?? "Invalid input";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.full_name || undefined,
      },
    },
  });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    requiresEmailConfirmation: !data.session,
    user: data.user
      ? {
          id: data.user.id,
          email: data.user.email ?? parsed.data.email,
        }
      : null,
  });
}
