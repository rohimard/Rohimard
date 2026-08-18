/**
 * Datos DEMO — se usan ÚNICAMENTE como fallback cuando Supabase no está
 * configurado. Cuando Supabase está configurado, la app usa exclusivamente
 * datos reales y nada de esto se muestra.
 */

import type {
  Client,
  DashboardStats,
  Profile,
  Quote,
  QuoteItem,
  QuoteWithClient,
} from "@/lib/types";

export const demoProfile: Profile = {
  id: "demo-user",
  full_name: "Carlos Ramírez",
  business_name: "Instalaciones RC",
  phone: "+52 55 1234 5678",
  email: "carlos@instalacionesrc.com",
  address: "Av. Reforma 123, CDMX",
  logo_url: null,
  currency: "USD",
  tax_rate: 0,
  quote_prefix: "COT-",
  quote_next_number: 5,
  created_at: "2026-08-01",
  updated_at: "2026-08-01",
};

export const demoClients: Client[] = [
  {
    id: "c1",
    user_id: "demo-user",
    name: "Juan Pérez",
    phone: "+52 55 9876 5432",
    email: "juan@correo.com",
    address: "Calle Falsa 123",
    created_at: "2026-08-10",
    updated_at: "2026-08-10",
  },
  {
    id: "c2",
    user_id: "demo-user",
    name: "María López",
    phone: "+52 55 5555 1111",
    email: "maria@correo.com",
    address: "Av. Central 45",
    created_at: "2026-08-11",
    updated_at: "2026-08-11",
  },
  {
    id: "c3",
    user_id: "demo-user",
    name: "Ferretería El Tornillo",
    phone: "+52 55 4444 2222",
    email: "ventas@eltornillo.com",
    address: "Blvd. Industria 900",
    created_at: "2026-08-12",
    updated_at: "2026-08-12",
  },
];

export const demoQuotes: QuoteWithClient[] = [
  {
    id: "q1",
    user_id: "demo-user",
    client_id: "c1",
    client_name: "Juan Pérez",
    quote_number: "COT-0001",
    service_description: "Instalación de cámaras de seguridad",
    subtotal: 315,
    discount: 0,
    tax: 0,
    total: 315,
    status: "draft",
    created_at: "2026-08-17",
    updated_at: "2026-08-17",
    sent_at: null,
    viewed_at: null,
    accepted_at: null,
    rejected_at: null,
  },
  {
    id: "q2",
    user_id: "demo-user",
    client_id: "c2",
    client_name: "María López",
    quote_number: "COT-0002",
    service_description: "Reparación de fuga en cocina",
    subtotal: 180,
    discount: 0,
    tax: 0,
    total: 180,
    status: "sent",
    created_at: "2026-08-16",
    updated_at: "2026-08-16",
    sent_at: "2026-08-16",
    viewed_at: null,
    accepted_at: null,
    rejected_at: null,
  },
  {
    id: "q3",
    user_id: "demo-user",
    client_id: "c3",
    client_name: "Ferretería El Tornillo",
    quote_number: "COT-0003",
    service_description: "Mantenimiento de aire acondicionado",
    subtotal: 640,
    discount: 0,
    tax: 0,
    total: 640,
    status: "accepted",
    created_at: "2026-08-14",
    updated_at: "2026-08-14",
    sent_at: "2026-08-14",
    viewed_at: "2026-08-14",
    accepted_at: "2026-08-15",
    rejected_at: null,
  },
];

export const demoQuoteItems: Record<string, QuoteItem[]> = {
  q1: [
    {
      id: "i1",
      quote_id: "q1",
      description: "Cámara de seguridad",
      quantity: 4,
      unit_price: 45,
      total: 180,
      created_at: "2026-08-17",
    },
    {
      id: "i2",
      quote_id: "q1",
      description: "Cable",
      quantity: 50,
      unit_price: 0.7,
      total: 35,
      created_at: "2026-08-17",
    },
    {
      id: "i3",
      quote_id: "q1",
      description: "Mano de obra",
      quantity: 1,
      unit_price: 100,
      total: 100,
      created_at: "2026-08-17",
    },
  ],
};

export function demoStats(): DashboardStats {
  return {
    creadas: demoQuotes.length,
    enviadas: demoQuotes.filter((q) => q.status !== "draft").length,
    aceptadas: demoQuotes.filter((q) => q.status === "accepted").length,
    totalCotizado: demoQuotes.reduce((s, q) => s + q.total, 0),
  };
}

// Prefill de la pantalla "Nueva cotización" en modo demo.
export const clienteDemo = {
  nombre: "Juan Pérez",
  servicio: "Instalación de cámaras de seguridad",
};

export const itemsDemo = [
  { descripcion: "Cámara de seguridad", cantidad: 4, precioUnitario: 45 },
  { descripcion: "Cable", cantidad: 50, precioUnitario: 0.7 },
  { descripcion: "Mano de obra", cantidad: 1, precioUnitario: 100 },
];

export type { Quote };
