type AuthLikeError = { message: string; code?: string };

export function isEmailNotConfirmedError(error: AuthLikeError): boolean {
  if (error.code === "email_not_confirmed") return true;
  return /email not confirmed/i.test(error.message);
}
