import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { formatAuthErrorMessage } from "@/lib/auth/format-auth-error";
import { nextPathSchema, signUpSchema } from "@/lib/validations/auth";

const signupPayloadSchema = signUpSchema.extend({
  next: nextPathSchema.optional().default("/"),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = signupPayloadSchema.safeParse(body);
  if (!parsed.success) {
    const fields = parsed.error.flatten().fieldErrors;
    const message =
      fields.email?.[0] ??
      fields.password?.[0] ??
      fields.full_name?.[0] ??
      fields.next?.[0] ??
      "Invalid input";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "");
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.full_name || undefined,
      },
      ...(appUrl
        ? {
            emailRedirectTo: `${appUrl}/login?next=${encodeURIComponent(parsed.data.next)}`,
          }
        : {}),
    },
  });

  if (error) {
    return NextResponse.json(
      {
        ok: false,
        error: formatAuthErrorMessage(error, {
          suggestLocalDemo: process.env.NODE_ENV === "development",
        }),
      },
      { status: 400 }
    );
  }

  return NextResponse.json({
    ok: true,
    next: parsed.data.next,
    requiresEmailConfirmation: !data.session,
    user: data.user
      ? {
          id: data.user.id,
          email: data.user.email ?? parsed.data.email,
        }
      : null,
  });
}
