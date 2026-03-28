import { NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const { id } = await params;
  return NextResponse.json({ id });
}

export async function PATCH(_req: Request, { params }: Ctx) {
  const { id } = await params;
  return NextResponse.json({ id, updated: true });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const { id } = await params;
  return NextResponse.json({ id, deleted: true });
}
