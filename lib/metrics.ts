import type { Database, Channel, Order } from "./types";

function isToday(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  );
}

export interface Metrics {
  pedidosHoy: number;
  pendientesEnvio: number; // pendiente + preparando
  incidencias: number;
  enCamino: number; // enviado + en_transito
  ingresos: number; // total de pedidos no cancelados
  ticketMedio: number;
  devolucionesAbiertas: number;
  // impacto de tracking proactivo
  notificacionesEnviadas: number;
  tasaProactiva: number; // % de pedidos enviados/entregados con aviso proactivo
  // reparto por canal
  porCanal: { channel: Channel; count: number; ingresos: number }[];
  // reparto por estado (para el "embudo")
  porEstado: { status: string; count: number }[];
}

export function computeMetrics(db: Database): Metrics {
  const orders = db.orders;
  const activos = orders.filter((o) => o.status !== "cancelado");

  const ingresos = activos.reduce((s, o) => s + o.total, 0);
  const enviadosOEntregados = orders.filter((o) =>
    ["enviado", "en_transito", "entregado", "incidencia"].includes(o.status)
  );
  const conAviso = enviadosOEntregados.filter((o) => !!o.lastCustomerNotifiedAt);

  const canales = new Map<Channel, { count: number; ingresos: number }>();
  for (const o of orders) {
    const cur = canales.get(o.channel) ?? { count: 0, ingresos: 0 };
    cur.count += 1;
    if (o.status !== "cancelado") cur.ingresos += o.total;
    canales.set(o.channel, cur);
  }

  const estados = new Map<string, number>();
  for (const o of orders) {
    estados.set(o.status, (estados.get(o.status) ?? 0) + 1);
  }

  const notificaciones = orders.reduce(
    (s, o) => s + o.timeline.filter((t) => t.channel && t.channel !== "sistema").length,
    0
  );

  return {
    pedidosHoy: orders.filter((o) => isToday(o.createdAt)).length,
    pendientesEnvio: orders.filter((o) => ["pendiente", "preparando"].includes(o.status)).length,
    incidencias: orders.filter((o) => o.status === "incidencia").length,
    enCamino: orders.filter((o) => ["enviado", "en_transito"].includes(o.status)).length,
    ingresos: Math.round(ingresos * 100) / 100,
    ticketMedio: activos.length ? Math.round((ingresos / activos.length) * 100) / 100 : 0,
    devolucionesAbiertas: db.returns.filter((r) => !["reembolsada", "rechazada"].includes(r.status)).length,
    notificacionesEnviadas: notificaciones,
    tasaProactiva: enviadosOEntregados.length
      ? Math.round((conAviso.length / enviadosOEntregados.length) * 100)
      : 0,
    porCanal: [...canales.entries()].map(([channel, v]) => ({ channel, ...v })).sort((a, b) => b.count - a.count),
    porEstado: [...estados.entries()].map(([status, count]) => ({ status, count })),
  };
}

export function sortByRecent(orders: Order[]): Order[] {
  return [...orders].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}
