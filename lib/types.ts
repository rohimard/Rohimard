// Modelo de dominio de Pulpo.
// Un "pedido" es la unidad central: llega desde un canal, tiene un ciclo de
// vida logístico y puede derivar en una incidencia o una devolución.

export type Channel =
  | "shopify"
  | "woocommerce"
  | "amazon"
  | "mercadolibre"
  | "instagram";

export type OrderStatus =
  | "pendiente" // pago confirmado, aún no preparado
  | "preparando" // en almacén
  | "enviado" // entregado al transportista
  | "en_transito"
  | "incidencia" // parado / problema de reparto
  | "entregado"
  | "cancelado";

export type Carrier = "SEUR" | "Correos Express" | "GLS" | "MRW" | "DHL";

export type ReturnStatus =
  | "solicitada"
  | "aprobada"
  | "rechazada"
  | "recibida"
  | "reembolsada";

export interface OrderItem {
  sku: string;
  name: string;
  qty: number;
  price: number; // por unidad, en EUR
}

export interface TrackingEvent {
  at: string; // ISO date
  status: OrderStatus;
  note: string;
  channel?: "sistema" | "email" | "whatsapp"; // cómo se notificó al cliente, si aplica
}

export interface Order {
  id: string; // id interno de Pulpo (ej. PLP-1042)
  channel: Channel;
  externalRef: string; // nº de pedido en el canal de origen
  createdAt: string; // ISO
  status: OrderStatus;
  customer: {
    name: string;
    email: string;
    phone?: string;
    country: string; // ISO-2
  };
  items: OrderItem[];
  shipping: {
    carrier?: Carrier;
    trackingNumber?: string;
    address: string;
    city: string;
    method: "estandar" | "express";
  };
  total: number; // EUR, calculado
  timeline: TrackingEvent[];
  lastCustomerNotifiedAt?: string; // ISO — para medir tracking proactivo
  flags: string[]; // etiquetas de automatizaciones aplicadas
}

export interface ReturnRequest {
  id: string; // RET-xxxx
  orderId: string;
  createdAt: string;
  status: ReturnStatus;
  reason: string;
  items: { sku: string; qty: number }[];
  refundAmount: number;
  resolution: "reembolso" | "cambio" | "pendiente";
}

export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  // condición evaluada sobre un pedido
  when: {
    field: "total" | "country" | "channel" | "method" | "status";
    op: "gt" | "lt" | "eq" | "neq";
    value: string | number;
  };
  // acción a aplicar
  then: {
    type: "assign_carrier" | "add_flag" | "notify_customer" | "set_status";
    value: string;
  };
  timesTriggered: number;
}

export interface Database {
  orders: Order[];
  returns: ReturnRequest[];
  automations: AutomationRule[];
}
