"use client";

import type { UserRole } from "@/types/user";

type Props = { value: UserRole | null; onChange: (role: UserRole) => void };

export function RoleSelector({ value, onChange }: Props) {
  return (
    <div role="group" aria-label="Role">
      {(["buyer", "merchant"] as const).map((r) => (
        <button
          key={r}
          type="button"
          data-active={value === r}
          onClick={() => onChange(r)}
        >
          {r}
        </button>
      ))}
    </div>
  );
}
