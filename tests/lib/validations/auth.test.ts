import { describe, expect, it } from "vitest";
import {
  parseSignInForm,
  parseSignUpForm,
  signInSchema,
} from "@/lib/validations/auth";

describe("signInSchema", () => {
  it("accepts valid email and password", () => {
    const r = signInSchema.safeParse({
      email: "  a@b.co  ",
      password: "secret",
      next: "/buyer/dashboard",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.email).toBe("a@b.co");
      expect(r.data.next).toBe("/buyer/dashboard");
    }
  });

  it("rejects invalid next (open redirect)", () => {
    const r = signInSchema.safeParse({
      email: "a@b.co",
      password: "x",
      next: "https://evil.com",
    });
    expect(r.success).toBe(false);
  });
});

describe("parseSignInForm", () => {
  it("parses FormData", () => {
    const fd = new FormData();
    fd.set("email", "user@test.com");
    fd.set("password", "pw");
    fd.set("next", "/");
    const r = parseSignInForm(fd);
    expect(r.success).toBe(true);
  });
});

describe("parseSignUpForm", () => {
  it("rejects short password", () => {
    const fd = new FormData();
    fd.set("email", "u@test.com");
    fd.set("password", "12345");
    const r = parseSignUpForm(fd);
    expect(r.success).toBe(false);
  });
});
