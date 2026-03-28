type Props = { title?: string };

export function AnalyticsChart({ title = "Analytics" }: Props) {
  return <section aria-label={title}>{title}</section>;
}
