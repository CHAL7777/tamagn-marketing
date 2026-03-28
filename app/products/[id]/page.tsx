type Props = { params: Promise<{ id: string }> };

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  return (
    <main>
      <h1>Product {id}</h1>
    </main>
  );
}
