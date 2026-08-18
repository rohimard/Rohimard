import type { QuoteStatus } from "@/lib/types";

const config: Record<QuoteStatus, { label: string; className: string }> = {
  draft: { label: "Borrador", className: "bg-ink-100 text-ink-600" },
  sent: { label: "Enviada", className: "bg-brand-50 text-brand-700" },
  viewed: { label: "Vista", className: "bg-amber-50 text-amber-700" },
  accepted: { label: "Aceptada", className: "bg-accent-50 text-accent-700" },
  rejected: { label: "Rechazada", className: "bg-red-50 text-red-700" },
};

export function EstadoBadge({ estado }: { estado: QuoteStatus }) {
  const { label, className } = config[estado] ?? config.draft;
  return <span className={`chip ${className}`}>{label}</span>;
}

/** Etiqueta de estado en texto plano (para selects/filtros). */
export const STATUS_LABELS: Record<QuoteStatus, string> = {
  draft: "Borrador",
  sent: "Enviada",
  viewed: "Vista",
  accepted: "Aceptada",
  rejected: "Rechazada",
};
