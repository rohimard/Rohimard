/**
 * Configuración del asistente de IA (Hugging Face Inference Providers).
 *
 * La app funciona SIN estas variables: el asistente simplemente se oculta y
 * la cotización se sigue creando a mano.
 *
 * Variables (.env.local):
 *   HF_TOKEN=hf_xxxxxxxxxxxxxxxxxxxx     ← https://huggingface.co/settings/tokens
 *   HF_MODEL=openai/gpt-oss-120b          ← opcional, para cambiar de modelo
 *   NEXT_PUBLIC_CHECKOUT_URL=https://...  ← opcional, enlace de pago del plan Pro
 */

/** Token de Hugging Face. Solo servidor: nunca se expone al navegador. */
export const HF_TOKEN = process.env.HF_TOKEN ?? "";

/** Endpoint compatible con OpenAI del router de Hugging Face. */
export const HF_BASE_URL =
  process.env.HF_BASE_URL ?? "https://router.huggingface.co/v1";

/**
 * Modelo principal y alternativos. Si el primero falla (proveedor caído,
 * modelo sin cupo…) se intenta con el siguiente antes de dar error.
 */
export const HF_MODELS: string[] = (
  process.env.HF_MODEL ??
  "openai/gpt-oss-120b,meta-llama/Llama-3.3-70B-Instruct,Qwen/Qwen2.5-72B-Instruct"
)
  .split(",")
  .map((m) => m.trim())
  .filter(Boolean);

/** True cuando el asistente de IA está disponible. */
export const isAiConfigured = HF_TOKEN.length > 0;

/** Créditos de IA incluidos por plan y mes. Debe coincidir con el SQL. */
export const AI_MONTHLY_CREDITS = { free: 5, pro: 300 } as const;

/** Precio del plan Pro (solo para mostrarlo en la página de precios). */
export const PRO_PRICE_USD = 9;

/** Enlace de pago del plan Pro (Stripe, Lemon Squeezy, Gumroad…). */
export const CHECKOUT_URL = process.env.NEXT_PUBLIC_CHECKOUT_URL ?? "";
