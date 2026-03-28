type Props = { children?: React.ReactNode };

export function Sidebar({ children }: Props) {
  return <aside>{children}</aside>;
}
