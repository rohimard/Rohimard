import { NextResponse } from "next/server";
import { getDb, saveDb } from "@/lib/db";
import { notifyCustomer } from "@/lib/orderFlow";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const db = getDb();
  const order = db.orders.find((o) => o.id === params.id);
  if (!order) {
    return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
  }

  let via: "email" | "whatsapp" = "whatsapp";
  try {
    const body = await req.json();
    if (body?.via === "email") via = "email";
  } catch {
    // sin cuerpo → whatsapp por defecto
  }

  notifyCustomer(order, via);
  saveDb(db);
  return NextResponse.json({
    ok: true,
    message: `Aviso enviado al cliente por ${via}`,
  });
}
