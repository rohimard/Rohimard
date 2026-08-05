import type { Order, OrderStatus, Carrier } from "./types";
import { applyAutomations, type AppliedAutomation } from "./automations";
import type { AutomationRule } from "./types";

// Flujo logístico "feliz" y siguiente paso disponible desde cada estado.
const NEXT: Partial<Record<OrderStatus, OrderStatus>> = {
  pendiente: "preparando",
  preparando: "enviado",
  enviado: "en_transito",
  en_transito: "entregado",
  incidencia: "en_transito", // reintento de reparto
};

const NEXT_LABEL: Partial<Record<OrderStatus, string>> = {
  pendiente: "Marcar como preparando",
  preparando: "Marcar como enviado",
  enviado: "Marcar en tránsito",
  en_transito: "Marcar como entregado",
  incidencia: "Reintentar reparto",
};

function randomCarrier(): Carrier {
  const c: Carrier[] = ["SEUR", "Correos Express", "GLS", "MRW"];
  return c[Math.floor(Math.random() * c.length)];
}

function randomTracking(carrier: Carrier): string {
  const prefix = carrier.slice(0, 3).toUpperCase().replace(/\s/g, "");
  return `${prefix}-${Math.floor(100000 + Math.random() * 899999)}`;
}

export function nextStatus(status: OrderStatus): OrderStatus | null {
  return NEXT[status] ?? null;
}

export function nextStatusLabel(status: OrderStatus): string | null {
  return NEXT_LABEL[status] ?? null;
}

const NOTE: Partial<Record<OrderStatus, string>> = {
  preparando: "Pedido en preparación en almacén",
  enviado: "Pedido entregado al transportista",
  en_transito: "Pedido en reparto",
  entregado: "Pedido entregado al cliente",
};

// Avanza el pedido al siguiente estado, registra el evento y ejecuta las
// automatizaciones. Devuelve las automatizaciones aplicadas.
export function advanceOrder(
  order: Order,
  rules: AutomationRule[]
): { applied: AppliedAutomation[]; changed: boolean } {
  const next = nextStatus(order.status);
  if (!next) return { applied: [], changed: false };

  // al enviar por primera vez, asignamos transportista si no lo tiene
  if (next === "enviado" && !order.shipping.carrier) {
    order.shipping.carrier = randomCarrier();
  }
  if (next === "enviado" && !order.shipping.trackingNumber && order.shipping.carrier) {
    order.shipping.trackingNumber = randomTracking(order.shipping.carrier);
  }

  order.status = next;
  order.timeline.push({
    at: new Date().toISOString(),
    status: next,
    note: NOTE[next] ?? "Estado actualizado",
    channel: "sistema",
  });

  const applied = applyAutomations(order, rules);
  return { applied, changed: true };
}

// Envía un aviso manual al cliente (registro en timeline).
export function notifyCustomer(order: Order, via: "email" | "whatsapp"): void {
  const now = new Date().toISOString();
  order.lastCustomerNotifiedAt = now;
  order.timeline.push({
    at: now,
    status: order.status,
    note: `Aviso de estado enviado al cliente (${via})`,
    channel: via,
  });
}
