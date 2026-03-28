export type UserRole =
  | "buyer"
  | "merchant"
  | "service_provider"
  | "admin"
  | "courier"
  | null
  | undefined;

export function defaultDashboardPath(role: UserRole): string {
  switch (role) {
    case "merchant":
      return "/merchant/dashboard";
    case "service_provider":
      return "/service-provider/dashboard";
    case "admin":
      return "/admin/dashboard";
    case "courier":
      return "/courier/deliveries";
    case "buyer":
    default:
      return "/buyer/dashboard";
  }
}

export function resolvePostAuthPath(next: string, role: UserRole): string {
  return next === "/" ? defaultDashboardPath(role) : next;
}
