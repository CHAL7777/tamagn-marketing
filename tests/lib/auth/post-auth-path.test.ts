import { describe, expect, it } from "vitest";
import { defaultDashboardPath, resolvePostAuthPath } from "@/lib/auth/post-auth-path";

describe("defaultDashboardPath", () => {
  it("maps roles to their dashboards", () => {
    expect(defaultDashboardPath("buyer")).toBe("/buyer/dashboard");
    expect(defaultDashboardPath("merchant")).toBe("/merchant/dashboard");
    expect(defaultDashboardPath("service_provider")).toBe("/service-provider/dashboard");
    expect(defaultDashboardPath("admin")).toBe("/admin/dashboard");
    expect(defaultDashboardPath("courier")).toBe("/courier/deliveries");
  });

  it("defaults unknown roles to buyer dashboard", () => {
    expect(defaultDashboardPath(null)).toBe("/buyer/dashboard");
  });
});

describe("resolvePostAuthPath", () => {
  it("preserves explicit next paths", () => {
    expect(resolvePostAuthPath("/checkout", "buyer")).toBe("/checkout");
  });

  it("uses role dashboard when next is root", () => {
    expect(resolvePostAuthPath("/", "merchant")).toBe("/merchant/dashboard");
  });
});
