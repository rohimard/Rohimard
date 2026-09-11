"use server";

import { getDataContext } from "@/lib/data/context";
import { isAiConfigured } from "@/lib/ai/config";
import { AiError } from "@/lib/ai/huggingface";
import { generateQuoteDraft, type QuoteDraft } from "@/lib/ai/quote-draft";
import type { ActionResult, AiCreditStatus } from "@/lib/types";

export interface GenerarBorradorInput {
  job: string;
  trade?: string;
  location?: string;
}

export interface BorradorResult {
  draft: QuoteDraft;
  credits: AiCreditStatus;
}

const MENSAJES: Record<AiError["code"], string> = {
  not_configured:
    "El asistente de IA no está configurado. Añade HF_TOKEN en las variables de entorno.",
  unauthorized:
    "El token de Hugging Face no es válido. Revisa HF_TOKEN en tu proyecto.",
  quota:
    "Se agotaron los créditos de inferencia de Hugging Face. Recárgalos en huggingface.co/settings/billing.",
  timeout: "El asistente tardó demasiado. Inténtalo otra vez.",
  upstream: "El asistente no está disponible ahora mismo. Inténtalo en un minuto.",
  parse: "El asistente devolvió una respuesta que no se pudo leer. Inténtalo otra vez.",
};

/** Créditos de IA restantes del usuario en el mes en curso. */
export async function getAiCreditsAction(): Promise<AiCreditStatus | null> {
  const ctx = await getDataContext();
  if (ctx.demo) return null;

  const { data, error } = await ctx.supabase.rpc("ai_credit_status");
  if (error || !data) {
    console.error("[getAiCreditsAction]", error?.message);
    return null;
  }
  return data as AiCreditStatus;
}

/**
 * Genera un borrador de cotización a partir de una descripción libre.
 *
 * El crédito se consume ANTES de llamar al modelo (evita que peticiones
 * simultáneas se salten la cuota) y se registra en `ai_usage`.
 */
export async function generarBorradorAction(
  input: GenerarBorradorInput,
): Promise<ActionResult<BorradorResult>> {
  const job = (input.job ?? "").trim();
  if (job.length < 10) {
    return {
      ok: false,
      error: "Describe el trabajo con un poco más de detalle (mínimo 10 caracteres).",
    };
  }
  if (job.length > 1000) {
    return { ok: false, error: "La descripción es demasiado larga (máximo 1000 caracteres)." };
  }

  if (!isAiConfigured) {
    return { ok: false, error: MENSAJES.not_configured };
  }

  const ctx = await getDataContext();
  if (ctx.demo) {
    return {
      ok: false,
      error: "Configura Supabase para usar el asistente con tu cuenta.",
    };
  }

  // 1) Consumir un crédito de forma atómica.
  const { data: credit, error: creditErr } = await ctx.supabase.rpc(
    "consume_ai_credit",
    { p_kind: "quote_draft", p_prompt: job },
  );
  if (creditErr || !credit) {
    console.error("[generarBorradorAction:credit]", creditErr?.message);
    return { ok: false, error: "No se pudo verificar tus créditos de IA." };
  }

  const credits = credit as AiCreditStatus;
  if (!credits.allowed) {
    return {
      ok: false,
      error:
        credits.plan === "pro"
          ? `Alcanzaste el límite de ${credits.limit} generaciones de este mes.`
          : `Usaste tus ${credits.limit} generaciones gratis del mes. Pasa a Pro para seguir.`,
    };
  }

  // 2) Pedir el borrador al modelo.
  try {
    const { data: profile } = await ctx.supabase
      .from("profiles")
      .select("currency")
      .eq("id", ctx.user.id)
      .maybeSingle();

    const draft = await generateQuoteDraft({
      job,
      trade: input.trade,
      location: input.location,
      currency: (profile?.currency as string | undefined) ?? "USD",
    });

    return { ok: true, data: { draft, credits } };
  } catch (err) {
    // El fallo es del proveedor, no del usuario: le devolvemos el crédito.
    await ctx.supabase.rpc("refund_ai_credit");

    if (err instanceof AiError) {
      console.error("[generarBorradorAction:ai]", err.code, err.message);
      return { ok: false, error: MENSAJES[err.code] };
    }
    console.error("[generarBorradorAction]", err);
    return { ok: false, error: MENSAJES.upstream };
  }
}
