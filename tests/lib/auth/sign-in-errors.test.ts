import { describe, expect, it } from "vitest";
import { isEmailNotConfirmedError } from "@/lib/auth/sign-in-errors";

describe("isEmailNotConfirmedError", () => {
  it("returns true for email_not_confirmed code", () => {
    expect(
      isEmailNotConfirmedError({
        message: "Something",
        code: "email_not_confirmed",
      })
    ).toBe(true);
  });

  it("returns true when message mentions email not confirmed", () => {
    expect(
      isEmailNotConfirmedError({ message: "Email not confirmed" })
    ).toBe(true);
  });

  it("returns false for other errors", () => {
    expect(
      isEmailNotConfirmedError({ message: "Invalid login credentials" })
    ).toBe(false);
  });
});
