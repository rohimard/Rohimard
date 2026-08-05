import type { Channel, OrderStatus, ReturnStatus } from "./types";

export function eur(n: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(n);
}

export function fecha(iso: string): string {
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function fechaCorta(iso: string): string {
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
  }).format(new Date(iso));
}

export function haceCuanto(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.floor(h / 24);
  return `hace ${d} d`;
}

export const canalLabel: Record<Channel, string> = {
  shopify: "Shopify",
  woocommerce: "WooCommerce",
  amazon: "Amazon",
  mercadolibre: "Mercado Libre",
  instagram: "Instagram",
};

export const canalColor: Record<Channel, string> = {
  shopify: "bg-green-100 text-green-800",
  woocommerce: "bg-purple-100 text-purple-800",
  amazon: "bg-amber-100 text-amber-800",
  mercadolibre: "bg-yellow-100 text-yellow-800",
  instagram: "bg-pink-100 text-pink-800",
};

export const estadoLabel: Record<OrderStatus, string> = {
  pendiente: "Pendiente",
  preparando: "Preparando",
  enviado: "Enviado",
  en_transito: "En tránsito",
  incidencia: "Incidencia",
  entregado: "Entregado",
  cancelado: "Cancelado",
};

export const estadoColor: Record<OrderStatus, string> = {
  pendiente: "bg-slate-100 text-slate-700",
  preparando: "bg-blue-100 text-blue-800",
  enviado: "bg-indigo-100 text-indigo-800",
  en_transito: "bg-cyan-100 text-cyan-800",
  incidencia: "bg-red-100 text-red-800",
  entregado: "bg-emerald-100 text-emerald-800",
  cancelado: "bg-gray-200 text-gray-600",
};

export const devolucionLabel: Record<ReturnStatus, string> = {
  solicitada: "Solicitada",
  aprobada: "Aprobada",
  rechazada: "Rechazada",
  recibida: "Recibida",
  reembolsada: "Reembolsada",
};

export const devolucionColor: Record<ReturnStatus, string> = {
  solicitada: "bg-amber-100 text-amber-800",
  aprobada: "bg-blue-100 text-blue-800",
  rechazada: "bg-red-100 text-red-800",
  recibida: "bg-indigo-100 text-indigo-800",
  reembolsada: "bg-emerald-100 text-emerald-800",
};
