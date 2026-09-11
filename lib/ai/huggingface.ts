/**
 * Cliente del router de inferencia de Hugging Face.
 *
 * SOLO SERVIDOR: se importa únicamente desde Server Actions ("use server"),
 * de modo que HF_TOKEN nunca llega al navegador.
 */

import { HF_BASE_URL, HF_MODELS, HF_TOKEN } from "./config";

/** Mensaje de chat en formato OpenAI (el router de HF es compatible). */
interface ChatMessage {
  role: "system" | "user";
  content: string;
}

interface ChatOptions {
  messages: ChatMessage[];
  maxTokens?: number;
  temperature?: number;
  /** Milisegundos antes de abortar la petición. */
  timeoutMs?: number;
}

export class AiError extends Error {
  constructor(
    message: string,
    readonly code:
      | "not_configured"
      | "unauthorized"
      | "quota"
      | "timeout"
      | "upstream"
      | "parse",
  ) {
    super(message);
    this.name = "AiError";
  }
}

/**
 * Llama al endpoint de chat de Hugging Face probando los modelos configurados
 * en orden. Devuelve el texto de la respuesta.
 */
export async function chatCompletion({
  messages,
  maxTokens = 900,
  temperature = 0.2,
  timeoutMs = 45_000,
}: ChatOptions): Promise<{ text: string; model: string }> {
  if (!HF_TOKEN) {
    throw new AiError("Falta HF_TOKEN.", "not_configured");
  }

  let lastError: AiError | null = null;

  for (const model of HF_MODELS) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(`${HF_BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages,
          max_tokens: maxTokens,
          temperature,
          // Formato JSON nativo cuando el proveedor lo soporta; si lo ignora,
          // el prompt ya pide JSON y `extractJson` lo rescata igualmente.
          response_format: { type: "json_object" },
        }),
        signal: controller.signal,
        cache: "no-store",
      });

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        if (res.status === 401 || res.status === 403) {
          throw new AiError(
            "El token de Hugging Face no es válido o no tiene permisos de inferencia.",
            "unauthorized",
          );
        }
        if (res.status === 402) {
          throw new AiError(
            "Se agotaron los créditos de Hugging Face de la cuenta.",
            "quota",
          );
        }
        // 4xx del modelo / 5xx del proveedor → probamos el siguiente modelo.
        lastError = new AiError(
          `Hugging Face respondió ${res.status}: ${body.slice(0, 200)}`,
          "upstream",
        );
        continue;
      }

      const json = (await res.json()) as {
        choices?: { message?: { content?: string | null } }[];
      };
      const text = json.choices?.[0]?.message?.content ?? "";
      if (!text.trim()) {
        lastError = new AiError("El modelo devolvió una respuesta vacía.", "upstream");
        continue;
      }
      return { text, model };
    } catch (err) {
      if (err instanceof AiError) {
        // Errores de credenciales o saldo no se arreglan cambiando de modelo.
        if (err.code === "unauthorized" || err.code === "quota") throw err;
        lastError = err;
      } else if ((err as Error)?.name === "AbortError") {
        lastError = new AiError("El modelo tardó demasiado en responder.", "timeout");
      } else {
        lastError = new AiError((err as Error)?.message ?? "Error de red.", "upstream");
      }
    } finally {
      clearTimeout(timer);
    }
  }

  throw lastError ?? new AiError("No se pudo contactar con el modelo.", "upstream");
}

/**
 * Extrae el primer objeto JSON de una respuesta de texto.
 *
 * Algunos modelos (gpt-oss, los de razonamiento) envuelven la respuesta en
 * bloques ```json o la preceden de texto; esto lo tolera.
 */
export function extractJson<T>(raw: string): T {
  const cleaned = raw
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/```json/gi, "```")
    .trim();

  const candidates: string[] = [];
  const fenced = cleaned.match(/```([\s\S]*?)```/);
  if (fenced) candidates.push(fenced[1]);
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start !== -1 && end > start) candidates.push(cleaned.slice(start, end + 1));
  candidates.push(cleaned);

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate.trim()) as T;
    } catch {
      // siguiente candidato
    }
  }
  throw new AiError("La respuesta del modelo no era JSON válido.", "parse");
}
