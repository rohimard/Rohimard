import { NextResponse } from "next/server";
import { getDb, saveDb } from "@/lib/db";
import { advanceOrder } from "@/lib/orderFlow";

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const db = getDb();
  const order = db.orders.find((o) => o.id === params.id);
  if (!order) {
    return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
  }

  const { applied, changed } = advanceOrder(order, db.automations);
  if (!changed) {
    return NextResponse.json({ error: "El pedido ya está en un estado final" }, { status: 400 });
  }

  saveDb(db);
  return NextResponse.json({
    ok: true,
    status: order.status,
    applied,
    message: `Pedido actualizado a «${order.status}»`,
  });
}
