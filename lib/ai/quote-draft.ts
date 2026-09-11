/**
 * Generación del borrador de cotización.
 *
 * Convierte la descripción en lenguaje natural de un trabajo
 * ("cambiar 6 tomacorrientes y el tablero en una casa de 2 pisos")
 * en una lista de ítems con cantidades y precios sugeridos.
 */

import { chatCompletion, extractJson, AiError } from "./huggingface";

export interface DraftItem {
  description: string;
  quantity: number;
  unit_price: number;
}

export interface QuoteDraft {
  /** Resumen del servicio para el campo "Descripción del trabajo". */
  service_description: string;
  items: DraftItem[];
  /** Notas del modelo: supuestos, lo que conviene confirmar con el cliente. */
  notes: string[];
}

export interface DraftRequest {
  /** Lo que escribió el usuario. */
  job: string;
  /** Oficio o sector, para afinar los ítems. */
  trade?: string;
  /** Ciudad o país: influye en el orden de magnitud de los precios. */
  location?: string;
  /** Código de moneda del perfil (USD, MXN, COP…). */
  currency?: string;
}

const SYSTEM_PROMPT = `Eres un presupuestador experto que ayuda a trabajadores independientes de habla hispana (electricistas, plomeros, pintores, técnicos, jardineros, fotógrafos, carpinteros) a desglosar un trabajo en una cotización.

Reglas:
- Responde ÚNICAMENTE con un objeto JSON válido, sin texto antes ni después.
- Desglosa el trabajo en entre 3 y 8 ítems concretos y vendibles: materiales, mano de obra, traslado o visita, y garantía si aplica.
- Cada descripción va en español neutro, en una sola línea, máximo 80 caracteres, sin precios dentro del texto.
- "quantity" es un número (horas, piezas, metros, jornadas). "unit_price" es el precio unitario en la moneda indicada, como número sin símbolos ni separadores de miles.
- Los precios son una ESTIMACIÓN de mercado para la zona indicada. Si no tienes referencia clara, usa un valor conservador y dilo en "notes".
- "notes" contiene entre 1 y 4 avisos cortos: supuestos que tomaste y lo que el profesional debe confirmar antes de enviar.
- Nunca inventes marcas, normativas ni plazos legales.

Formato exacto de la respuesta:
{"service_description":"string","items":[{"description":"string","quantity":number,"unit_price":number}],"notes":["string"]}`;

function buildUserPrompt(req: DraftRequest): string {
  const lines = [`Trabajo a cotizar: ${req.job.trim()}`];
  if (req.trade?.trim()) lines.push(`Oficio: ${req.trade.trim()}`);
  if (req.location?.trim()) lines.push(`Zona: ${req.location.trim()}`);
  lines.push(`Moneda: ${req.currency || "USD"}`);
  lines.push("Devuelve solo el JSON.");
  return lines.join("\n");
}

/** Limpia y valida lo que devolvió el modelo antes de mostrarlo. */
function sanitize(raw: unknown, fallbackDescription: string): QuoteDraft {
  const obj = (raw ?? {}) as Record<string, unknown>;

  const items: DraftItem[] = (Array.isArray(obj.items) ? obj.items : [])
    .map((it) => {
      const item = (it ?? {}) as Record<string, unknown>;
      const quantity = Number(item.quantity);
      const unitPrice = Number(item.unit_price ?? item.unitPrice ?? item.price);
      return {
        description: String(item.description ?? "").trim().slice(0, 120),
        quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : 1,
        unit_price:
          Number.isFinite(unitPrice) && unitPrice >= 0 ? Math.round(unitPrice * 100) / 100 : 0,
      };
    })
    .filter((it) => it.description.length > 0)
    .slice(0, 12);

  if (items.length === 0) {
    throw new AiError("El modelo no devolvió ítems utilizables.", "parse");
  }

  const notes = (Array.isArray(obj.notes) ? obj.notes : [])
    .map((n) => String(n ?? "").trim())
    .filter(Boolean)
    .slice(0, 4);

  const description = String(obj.service_description ?? "").trim();

  return {
    service_description: (description || fallbackDescription).slice(0, 400),
    items,
    notes,
  };
}

/** Pide el borrador al modelo y devuelve el resultado ya saneado. */
export async function generateQuoteDraft(req: DraftRequest): Promise<QuoteDraft> {
  const { text } = await chatCompletion({
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildUserPrompt(req) },
    ],
    maxTokens: 900,
    temperature: 0.2,
  });

  return sanitize(extractJson<unknown>(text), req.job.trim());
}
