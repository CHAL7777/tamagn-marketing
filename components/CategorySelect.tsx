"use client";

type Props = {
  value: string;
  onChange: (id: string) => void;
  options: { id: string; label: string }[];
};

export function CategorySelect({ value, onChange, options }: Props) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label="Category"
    >
      {options.map((o) => (
        <option key={o.id} value={o.id}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
