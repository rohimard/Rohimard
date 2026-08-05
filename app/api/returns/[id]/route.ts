import { NextResponse } from "next/server";
import { getDb, saveDb } from "@/lib/db";
import type { ReturnStatus } from "@/lib/types";

const VALID: ReturnStatus[] = [
  "solicitada",
  "aprobada",
  "rechazada",
  "recibida",
  "reembolsada",
];

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const db = getDb();
  const ret = db.returns.find((r) => r.id === params.id);
  if (!ret) {
    return NextResponse.json({ error: "Devolución no encontrada" }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  const status = body?.status as ReturnStatus;
  if (!VALID.includes(status)) {
    return NextResponse.json({ error: "Estado no válido" }, { status: 400 });
  }

  ret.status = status;
  if (status === "reembolsada") ret.resolution = "reembolso";
  saveDb(db);

  return NextResponse.json({ ok: true, status: ret.status });
}
