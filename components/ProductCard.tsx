type Props = { title: string; price: number };

export function ProductCard({ title, price }: Props) {
  return (
    <article>
      <h2>{title}</h2>
      <p>{price}</p>
    </article>
  );
}
