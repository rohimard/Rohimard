"use server";

import { revalidatePath } from "next/cache";
import { getDataContext } from "@/lib/data/context";
import { round2 } from "@/lib/format";
import type { ActionResult } from "@/lib/types";

export interface QuoteItemInput {
  description: string;
  quantity: number;
  unit_price: number;
}

export interface CreateQuoteInput {
  clientId: string | null;
  newClient: { name: string; phone: string; email: string; address: string } | null;
  serviceDescription: string;
  items: QuoteItemInput[];
  discount: number;
  taxRate: number; // porcentaje
}

const DEMO_MSG =
  "Estás en modo demo. Configura Supabase para guardar cotizaciones reales.";

export async function createQuoteAction(
  input: CreateQuoteInput,
): Promise<ActionResult<{ id: string; quote_number: string }>> {
  const ctx = await getDataContext();
  if (ctx.demo) return { ok: false, error: DEMO_MSG };

  // 1) Validación mínima.
  const items = (input.items ?? [])
    .map((it) => ({
      description: (it.description ?? "").trim(),
      quantity: Math.max(0, Number(it.quantity) || 0),
      unit_price: Math.max(0, Number(it.unit_price) || 0),
    }))
    .filter((it) => it.description || it.quantity > 0 || it.unit_price > 0);

  if (items.length === 0) {
    return { ok: false, error: "Agrega al menos un ítem a la cotización." };
  }

  try {
    // 2) Resolver el cliente (existente o nuevo).
    let clientId = input.clientId;
    if (input.newClient && input.newClient.name.trim()) {
      const { data: created, error: clientErr } = await ctx.supabase
        .from("clients")
        .insert({
          user_id: ctx.user.id,
          name: input.newClient.name.trim(),
          phone: input.newClient.phone.trim(),
          email: input.newClient.email.trim(),
          address: input.newClient.address.trim(),
        })
        .select("id")
        .single();
      if (clientErr || !created) {
        console.error("[createQuoteAction:newClient]", clientErr?.message);
        return { ok: false, error: "No se pudo crear el cliente." };
      }
      clientId = created.id as string;
    }

    // 3) Totales calculados en el servidor (nunca se confía en el cliente).
    const subtotal = round2(
      items.reduce((s, it) => s + round2(it.quantity * it.unit_price), 0),
    );
    const discount = Math.min(Math.max(0, Number(input.discount) || 0), subtotal);
    const taxRate = Math.min(Math.max(0, Number(input.taxRate) || 0), 100);
    const base = round2(subtotal - discount);
    const tax = round2((base * taxRate) / 100);
    const total = round2(base + tax);

    // 4) Número único y consecutivo (atómico, en la base de datos).
    const { data: number, error: numErr } = await ctx.supabase.rpc(
      "allocate_quote_number",
    );
    if (numErr || !number) {
      console.error("[createQuoteAction:number]", numErr?.message);
      return { ok: false, error: "No se pudo asignar el número de cotización." };
    }

    // 5) Insertar la cotización.
    const { data: quote, error: quoteErr } = await ctx.supabase
      .from("quotes")
      .insert({
        user_id: ctx.user.id,
        client_id: clientId,
        quote_number: number as string,
        service_description: input.serviceDescription.trim(),
        subtotal,
        discount,
        tax,
        total,
        status: "draft",
      })
      .select("id, quote_number")
      .single();
    if (quoteErr || !quote) {
      console.error("[createQuoteAction:quote]", quoteErr?.message);
      return { ok: false, error: "No se pudo guardar la cotización." };
    }

    // 6) Insertar los ítems (total se calcula solo en la base de datos).
    const { error: itemsErr } = await ctx.supabase.from("quote_items").insert(
      items.map((it) => ({
        quote_id: quote.id,
        description: it.description,
        quantity: it.quantity,
        unit_price: it.unit_price,
      })),
    );
    if (itemsErr) {
      console.error("[createQuoteAction:items]", itemsErr.message);
      return { ok: false, error: "La cotización se creó pero fallaron los ítems." };
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/cotizaciones");
    return {
      ok: true,
      data: { id: quote.id as string, quote_number: quote.quote_number as string },
    };
  } catch (err) {
    console.error("[createQuoteAction]", err);
    return { ok: false, error: "Ocurrió un error al guardar. Inténtalo otra vez." };
  }
}
