import { NextResponse } from "next/server";
import { resetDb } from "@/lib/db";

// Reinicia el estado a los datos de ejemplo. Útil para la demo.
export async function POST() {
  resetDb();
  return NextResponse.json({ ok: true, message: "Datos de demo reiniciados" });
}
