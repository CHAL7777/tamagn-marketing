import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { formatAuthErrorMessage } from "@/lib/auth/format-auth-error";
import { isEmailNotConfirmedError } from "@/lib/auth/sign-in-errors";
import { nextPathSchema, signInSchema } from "@/lib/validations/auth";

const loginPayloadSchema = signInSchema.extend({
  next: nextPathSchema.optional().default("/"),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = loginPayloadSchema.safeParse(body);
  if (!parsed.success) {
    const fields = parsed.error.flatten().fieldErrors;
    const message =
      fields.email?.[0] ?? fields.password?.[0] ?? fields.next?.[0] ?? "Invalid input";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error || !data.user) {
    if (error && isEmailNotConfirmedError(error)) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "This account is not confirmed yet. Open the link in the email we sent you, or request another confirmation email.",
          code: "email_not_confirmed",
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        ok: false,
        error: formatAuthErrorMessage(error ?? { message: "Login failed" }, {
          suggestLocalDemo: process.env.NODE_ENV === "development",
        }),
      },
      { status: 401 }
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, merchant_id, service_provider_id, full_name")
    .eq("id", data.user.id)
    .maybeSingle();

  return NextResponse.json({
    ok: true,
    next: parsed.data.next,
    user: {
      id: data.user.id,
      email: data.user.email ?? parsed.data.email,
    },
    profile: profile ?? null,
  });
}
