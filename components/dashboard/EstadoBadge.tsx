import type { EstadoCotizacion } from "@/lib/demo";

const config: Record<EstadoCotizacion, { label: string; className: string }> = {
  pendiente: {
    label: "Pendiente",
    className: "bg-amber-50 text-amber-700",
  },
  enviada: {
    label: "Enviada",
    className: "bg-brand-50 text-brand-700",
  },
  aceptada: {
    label: "Aceptada",
    className: "bg-accent-50 text-accent-700",
  },
  rechazada: {
    label: "Rechazada",
    className: "bg-red-50 text-red-700",
  },
};

export function EstadoBadge({ estado }: { estado: EstadoCotizacion }) {
  const { label, className } = config[estado];
  return <span className={`chip ${className}`}>{label}</span>;
}
