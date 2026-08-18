/** Tipos de dominio, alineados con el esquema de Supabase. */

export type QuoteStatus = "draft" | "sent" | "viewed" | "accepted" | "rejected";

export interface Profile {
  id: string;
  full_name: string;
  business_name: string;
  phone: string;
  email: string;
  address: string;
  logo_url: string | null;
  currency: string;
  tax_rate: number;
  quote_prefix: string;
  quote_next_number: number;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  created_at: string;
  updated_at: string;
}

export interface Quote {
  id: string;
  user_id: string;
  client_id: string | null;
  quote_number: string;
  service_description: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  status: QuoteStatus;
  created_at: string;
  updated_at: string;
  sent_at: string | null;
  viewed_at: string | null;
  accepted_at: string | null;
  rejected_at: string | null;
}

/** Cotización con el nombre del cliente resuelto (para listados). */
export interface QuoteWithClient extends Quote {
  client_name: string | null;
}

export interface QuoteItem {
  id: string;
  quote_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
  created_at: string;
}

export interface DashboardStats {
  creadas: number;
  enviadas: number;
  aceptadas: number;
  totalCotizado: number;
}

/** Resultado estándar de las Server Actions. */
export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string };
