import type {
  AutomationRule,
  Database,
  Order,
  OrderItem,
  ReturnRequest,
  TrackingEvent,
} from "./types";

// Genera datos de ejemplo realistas con fechas relativas a "hoy", para que la
// demo siempre tenga pedidos recientes.

function daysAgo(d: number, hour = 10): string {
  const date = new Date();
  date.setDate(date.getDate() - d);
  date.setHours(hour, Math.floor(Math.random() * 59), 0, 0);
  return date.toISOString();
}

function total(items: OrderItem[]): number {
  return Math.round(items.reduce((s, i) => s + i.price * i.qty, 0) * 100) / 100;
}

let seq = 1040;
function nextId(): string {
  seq += 1;
  return `PLP-${seq}`;
}

function order(partial: Omit<Order, "id" | "total"> & { total?: number }): Order {
  const id = nextId();
  return { ...partial, id, total: partial.total ?? total(partial.items) };
}

function tl(events: [number, TrackingEvent["status"], string, TrackingEvent["channel"]?][]): TrackingEvent[] {
  return events.map(([d, status, note, channel]) => ({
    at: daysAgo(d),
    status,
    note,
    channel: channel ?? "sistema",
  }));
}

export function buildSeed(): Database {
  seq = 1040;

  const orders: Order[] = [
    order({
      channel: "shopify",
      externalRef: "#SH-2231",
      createdAt: daysAgo(0, 9),
      status: "pendiente",
      customer: { name: "Lucía Fernández", email: "lucia.f@gmail.com", phone: "+34 611 223 344", country: "ES" },
      items: [
        { sku: "CAM-AZ-M", name: "Camiseta orgánica azul (M)", qty: 2, price: 24.9 },
        { sku: "GOR-NGR", name: "Gorra negra unisex", qty: 1, price: 15.0 },
      ],
      shipping: { address: "C/ Mayor 12, 3ºB", city: "Madrid", method: "estandar" },
      timeline: tl([[0, "pendiente", "Pago confirmado"]]),
      flags: [],
    }),
    order({
      channel: "amazon",
      externalRef: "702-9981234-11",
      createdAt: daysAgo(0, 11),
      status: "pendiente",
      customer: { name: "Carlos Ruiz", email: "cruiz@outlook.com", country: "ES" },
      items: [{ sku: "BOT-500", name: "Botella térmica 500ml", qty: 3, price: 19.95 }],
      shipping: { address: "Av. Diagonal 405", city: "Barcelona", method: "express" },
      timeline: tl([[0, "pendiente", "Pago confirmado vía Amazon Pay"]]),
      flags: [],
    }),
    order({
      channel: "woocommerce",
      externalRef: "wc_8841",
      createdAt: daysAgo(1, 16),
      status: "preparando",
      customer: { name: "Marta Gómez", email: "marta.gomez@gmail.com", phone: "+34 622 100 200", country: "ES" },
      items: [{ sku: "ZAP-42", name: "Zapatillas running (42)", qty: 1, price: 79.0 }],
      shipping: { carrier: "SEUR", address: "C/ Sol 8", city: "Sevilla", method: "estandar" },
      timeline: tl([
        [1, "pendiente", "Pago confirmado"],
        [0, "preparando", "Asignado a almacén A1"],
      ]),
      flags: [],
    }),
    order({
      channel: "mercadolibre",
      externalRef: "ML-55120987",
      createdAt: daysAgo(1, 12),
      status: "enviado",
      customer: { name: "Diego Salas", email: "diegosalas@gmail.com", phone: "+52 55 1234 5678", country: "MX" },
      items: [{ sku: "AUR-BT", name: "Auriculares bluetooth", qty: 1, price: 45.0 }],
      shipping: { carrier: "DHL", trackingNumber: "DHL-778120", address: "Reforma 222", city: "CDMX", method: "express" },
      timeline: tl([
        [1, "pendiente", "Pago confirmado"],
        [1, "preparando", "Preparado en almacén"],
        [0, "enviado", "Entregado a DHL", "whatsapp"],
      ]),
      lastCustomerNotifiedAt: daysAgo(0),
      flags: ["internacional"],
    }),
    order({
      channel: "instagram",
      externalRef: "IG-DM-3391",
      createdAt: daysAgo(2, 18),
      status: "en_transito",
      customer: { name: "Ana Prieto", email: "ana.prieto@gmail.com", phone: "+34 655 900 111", country: "ES" },
      items: [{ sku: "VEL-SOJ", name: "Vela de soja artesanal", qty: 4, price: 12.5 }],
      shipping: { carrier: "Correos Express", trackingNumber: "CE-4410023", address: "C/ Luna 45", city: "Valencia", method: "estandar" },
      timeline: tl([
        [2, "pendiente", "Pago confirmado"],
        [2, "preparando", "Preparado"],
        [1, "enviado", "Entregado a Correos Express", "email"],
        [0, "en_transito", "En reparto", "whatsapp"],
      ]),
      lastCustomerNotifiedAt: daysAgo(0),
      flags: [],
    }),
    order({
      channel: "shopify",
      externalRef: "#SH-2228",
      createdAt: daysAgo(4, 10),
      status: "incidencia",
      customer: { name: "Roberto Márquez", email: "rmarquez@gmail.com", phone: "+34 699 001 002", country: "ES" },
      items: [{ sku: "MOC-XL", name: "Mochila urbana XL", qty: 1, price: 59.9 }],
      shipping: { carrier: "GLS", trackingNumber: "GLS-9982210", address: "C/ Río 3", city: "Bilbao", method: "estandar" },
      timeline: tl([
        [4, "pendiente", "Pago confirmado"],
        [3, "preparando", "Preparado"],
        [3, "enviado", "Entregado a GLS", "email"],
        [1, "incidencia", "Paquete retenido en centro logístico: dirección incompleta"],
      ]),
      flags: ["revisar"],
    }),
    order({
      channel: "amazon",
      externalRef: "702-3312876-90",
      createdAt: daysAgo(3, 14),
      status: "incidencia",
      customer: { name: "Sofía Navarro", email: "sofia.navarro@gmail.com", country: "ES" },
      items: [{ sku: "PER-30", name: "Perfume 30ml", qty: 1, price: 39.0 }],
      shipping: { carrier: "MRW", trackingNumber: "MRW-220198", address: "C/ Alta 17", city: "Zaragoza", method: "express" },
      timeline: tl([
        [3, "pendiente", "Pago confirmado"],
        [3, "preparando", "Preparado"],
        [2, "enviado", "Entregado a MRW", "email"],
        [0, "incidencia", "2º intento de entrega fallido"],
      ]),
      flags: ["revisar"],
    }),
    order({
      channel: "woocommerce",
      externalRef: "wc_8830",
      createdAt: daysAgo(6, 9),
      status: "entregado",
      customer: { name: "Pablo Ortiz", email: "pablo.ortiz@gmail.com", phone: "+34 611 555 777", country: "ES" },
      items: [
        { sku: "LIB-01", name: "Libreta A5 tapa dura", qty: 3, price: 9.9 },
        { sku: "BOL-SET", name: "Set 4 bolígrafos", qty: 1, price: 7.5 },
      ],
      shipping: { carrier: "SEUR", trackingNumber: "SEUR-118820", address: "C/ Paz 9", city: "Málaga", method: "estandar" },
      timeline: tl([
        [6, "pendiente", "Pago confirmado"],
        [5, "preparando", "Preparado"],
        [5, "enviado", "Entregado a SEUR", "email"],
        [4, "en_transito", "En reparto", "whatsapp"],
        [3, "entregado", "Entregado — firmado por destinatario", "whatsapp"],
      ]),
      lastCustomerNotifiedAt: daysAgo(3),
      flags: [],
    }),
    order({
      channel: "shopify",
      externalRef: "#SH-2210",
      createdAt: daysAgo(9, 13),
      status: "entregado",
      customer: { name: "Elena Castro", email: "elena.castro@gmail.com", phone: "+34 677 121 212", country: "ES" },
      items: [{ sku: "ABR-L", name: "Abrigo lana (L)", qty: 1, price: 129.0 }],
      shipping: { carrier: "SEUR", trackingNumber: "SEUR-110021", address: "C/ Norte 55", city: "Madrid", method: "express" },
      timeline: tl([
        [9, "pendiente", "Pago confirmado"],
        [8, "preparando", "Preparado"],
        [8, "enviado", "Entregado a SEUR", "email"],
        [7, "entregado", "Entregado", "whatsapp"],
      ]),
      lastCustomerNotifiedAt: daysAgo(7),
      flags: ["alto_valor"],
    }),
    order({
      channel: "mercadolibre",
      externalRef: "ML-55098432",
      createdAt: daysAgo(11, 15),
      status: "entregado",
      customer: { name: "Valentina Rojas", email: "valen.rojas@gmail.com", phone: "+54 11 2345 6789", country: "AR" },
      items: [{ sku: "REL-DIG", name: "Reloj digital deportivo", qty: 1, price: 65.0 }],
      shipping: { carrier: "DHL", trackingNumber: "DHL-660877", address: "Corrientes 1500", city: "Buenos Aires", method: "express" },
      timeline: tl([
        [11, "pendiente", "Pago confirmado"],
        [10, "preparando", "Preparado"],
        [10, "enviado", "Entregado a DHL", "email"],
        [7, "entregado", "Entregado", "whatsapp"],
      ]),
      lastCustomerNotifiedAt: daysAgo(7),
      flags: ["internacional"],
    }),
    order({
      channel: "shopify",
      externalRef: "#SH-2205",
      createdAt: daysAgo(14, 11),
      status: "cancelado",
      customer: { name: "Javier León", email: "javier.leon@gmail.com", country: "ES" },
      items: [{ sku: "TAZ-CER", name: "Taza cerámica premium", qty: 2, price: 18.0 }],
      shipping: { address: "C/ Este 21", city: "Granada", method: "estandar" },
      timeline: tl([
        [14, "pendiente", "Pago confirmado"],
        [13, "cancelado", "Cancelado a petición del cliente — reembolso emitido"],
      ]),
      flags: [],
    }),
    order({
      channel: "woocommerce",
      externalRef: "wc_8801",
      createdAt: daysAgo(16, 10),
      status: "entregado",
      customer: { name: "Nuria Sáez", email: "nuria.saez@gmail.com", phone: "+34 688 333 444", country: "ES" },
      items: [{ sku: "MAN-100", name: "Manta polar 100x150", qty: 1, price: 34.9 }],
      shipping: { carrier: "GLS", trackingNumber: "GLS-990011", address: "C/ Oeste 4", city: "Oviedo", method: "estandar" },
      timeline: tl([
        [16, "pendiente", "Pago confirmado"],
        [15, "preparando", "Preparado"],
        [15, "enviado", "Entregado a GLS", "email"],
        [13, "entregado", "Entregado", "whatsapp"],
      ]),
      lastCustomerNotifiedAt: daysAgo(13),
      flags: [],
    }),
  ];

  const byRef = (ref: string) => orders.find((o) => o.externalRef === ref)!;

  const returns: ReturnRequest[] = [
    {
      id: "RET-3001",
      orderId: byRef("wc_8830").id,
      createdAt: daysAgo(2),
      status: "solicitada",
      reason: "Talla incorrecta, quiero una M",
      items: [{ sku: "LIB-01", qty: 1 }],
      refundAmount: 9.9,
      resolution: "cambio",
    },
    {
      id: "RET-3000",
      orderId: byRef("#SH-2210").id,
      createdAt: daysAgo(4),
      status: "aprobada",
      reason: "No me convence el color",
      items: [{ sku: "ABR-L", qty: 1 }],
      refundAmount: 129.0,
      resolution: "reembolso",
    },
    {
      id: "RET-2999",
      orderId: byRef("wc_8801").id,
      createdAt: daysAgo(8),
      status: "reembolsada",
      reason: "Producto con defecto (costura)",
      items: [{ sku: "MAN-100", qty: 1 }],
      refundAmount: 34.9,
      resolution: "reembolso",
    },
  ];

  const automations: AutomationRule[] = [
    {
      id: "auto-1",
      name: "Envío express para pedidos de alto valor",
      description: "Si el importe supera 100 €, asigna SEUR y marca el pedido como prioritario.",
      enabled: true,
      when: { field: "total", op: "gt", value: 100 },
      then: { type: "assign_carrier", value: "SEUR" },
      timesTriggered: 2,
    },
    {
      id: "auto-2",
      name: "Etiquetar pedidos internacionales",
      description: "Si el país no es ES, añade la etiqueta 'internacional' para revisión aduanera.",
      enabled: true,
      when: { field: "country", op: "neq", value: "ES" },
      then: { type: "add_flag", value: "internacional" },
      timesTriggered: 2,
    },
    {
      id: "auto-3",
      name: "Aviso proactivo al enviar",
      description: "Cuando un pedido pasa a 'enviado', notifica automáticamente al cliente por WhatsApp/email.",
      enabled: true,
      when: { field: "status", op: "eq", value: "enviado" },
      then: { type: "notify_customer", value: "whatsapp" },
      timesTriggered: 6,
    },
    {
      id: "auto-4",
      name: "Marcar incidencias de reparto",
      description: "Si un pedido entra en incidencia, añade la etiqueta 'revisar' y avisa al equipo de soporte.",
      enabled: true,
      when: { field: "status", op: "eq", value: "incidencia" },
      then: { type: "add_flag", value: "revisar" },
      timesTriggered: 2,
    },
    {
      id: "auto-5",
      name: "Envío estándar para Instagram",
      description: "Los pedidos de Instagram usan Correos Express por defecto.",
      enabled: false,
      when: { field: "channel", op: "eq", value: "instagram" },
      then: { type: "assign_carrier", value: "Correos Express" },
      timesTriggered: 0,
    },
  ];

  return { orders: orders.reverse(), returns, automations };
}
