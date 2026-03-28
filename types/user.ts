export type UserRole = "buyer" | "merchant" | "service_provider" | "admin";

export type User = {
  id: string;
  email: string;
  role: UserRole;
};
