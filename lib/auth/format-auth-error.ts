type AuthLikeError = { message: string; code?: string; status?: number };

export type FormatAuthErrorOptions = {
  /** When true, mention the on-page demo panel (local dev). */
  suggestLocalDemo?: boolean;
};

/**
 * Maps Supabase Auth API errors to clearer copy for signup / resend / sign-in.
 */
export function formatAuthErrorMessage(
  error: AuthLikeError,
  options: FormatAuthErrorOptions = {}
): string {
  const code = error.code ?? "";
  const msg = error.message.toLowerCase();
  const { suggestLocalDemo = false } = options;

  if (
    code === "over_email_send_rate_limit" ||
    msg.includes("email rate limit") ||
    (msg.includes("rate limit") && msg.includes("email"))
  ) {
    let out =
      "Too many confirmation emails were sent from this project recently (Supabase limit). Wait about an hour before signing up or using “Resend”, or confirm an existing user from the Supabase Dashboard.";
    if (suggestLocalDemo) {
      out +=
        " For local development you can use the demo accounts panel on this page instead.";
    }
    return out;
  }

  if (code === "over_request_rate_limit" || msg.includes("request rate limit")) {
    return "Too many requests. Please wait a few minutes and try again.";
  }

  return error.message;
}
