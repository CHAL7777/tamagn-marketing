type Props = { params: Promise<{ id: string }> };

export default async function BuyerOrderDetailPage({ params }: Props) {
  const { id } = await params;
  return (
    <main>
      <h1>Order {id}</h1>
    </main>
  );
}
