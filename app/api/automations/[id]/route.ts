import { NextResponse } from "next/server";
import { getDb, saveDb } from "@/lib/db";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const db = getDb();
  const rule = db.automations.find((r) => r.id === params.id);
  if (!rule) {
    return NextResponse.json({ error: "Regla no encontrada" }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  if (typeof body?.enabled === "boolean") {
    rule.enabled = body.enabled;
  }
  saveDb(db);

  return NextResponse.json({ ok: true, enabled: rule.enabled });
}
