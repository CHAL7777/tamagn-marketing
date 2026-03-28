import { describe, expect, it } from "vitest";
import { formatAuthErrorMessage } from "@/lib/auth/format-auth-error";

describe("formatAuthErrorMessage", () => {
  it("maps over_email_send_rate_limit", () => {
    const m = formatAuthErrorMessage({
      message: "email rate limit exceeded",
      code: "over_email_send_rate_limit",
    });
    expect(m).toContain("Too many confirmation emails");
    expect(m).toContain("Supabase");
  });

  it("adds local demo hint when suggestLocalDemo", () => {
    const m = formatAuthErrorMessage(
      { message: "email rate limit exceeded", code: "over_email_send_rate_limit" },
      { suggestLocalDemo: true }
    );
    expect(m).toContain("demo accounts panel");
  });

  it("omits demo hint when not suggestLocalDemo", () => {
    const m = formatAuthErrorMessage(
      { message: "email rate limit exceeded", code: "over_email_send_rate_limit" },
      { suggestLocalDemo: false }
    );
    expect(m).not.toContain("demo accounts panel");
  });

  it("passes through unknown messages", () => {
    expect(formatAuthErrorMessage({ message: "Custom problem" })).toBe(
      "Custom problem"
    );
  });
});
