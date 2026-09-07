// Tipos de la base de datos MOMENTIA (reflejan supabase/migrations/0001_schema.sql).
// Escritos a mano para mantener el proyecto independiente del CLI de Supabase;
// si prefieres generarlos automáticamente: `supabase gen types typescript`.

export type OccasionType = "pareja" | "mama" | "cumpleanos" | "amistad" | "agradecimiento" | "empresa" | "otra";
export type MusicOptionType = "cancion" | "playlist" | "spotify" | "sin_musica";
export type PrivacyLevelType = "public" | "private" | "temporal";
export type ExperienceStatusType = "borrador" | "publicada" | "archivada";
export type MediaKindType = "photo" | "video";
export type OrderStatusType =
  | "nuevo"
  | "pago_pendiente"
  | "confirmado"
  | "en_produccion"
  | "listo"
  | "enviado"
  | "entregado"
  | "cancelado";
export type PaymentMethodType = "yape" | "plin" | "transferencia" | "pasarela";
export type PaymentStatusType = "pendiente" | "en_revision" | "validado" | "rechazado";
export type CouponDiscountType = "percentage" | "fixed";
export type LeadStatusType = "nuevo" | "contactado" | "cotizado" | "ganado" | "perdido";

type Table<Row, Insert, Update = Partial<Insert>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type ProfileRow = {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: "admin" | "customer";
  created_at: string;
  updated_at: string;
}

export type ProductRow = {
  id: string;
  slug: string;
  name: string;
  eyebrow: string | null;
  phrase: string | null;
  description: string | null;
  price_from: number;
  accent: string;
  includes: string[];
  featured: boolean;
  active: boolean;
  sort_order: number;
  cover_image_url: string | null;
  created_at: string;
  updated_at: string;
}

export type ProductVariantRow = {
  id: string;
  product_id: string;
  name: string;
  price: number;
  sku: string | null;
  active: boolean;
  created_at: string;
}

export type OrderRow = {
  id: string;
  order_number: string;
  customer_id: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  occasion: OccasionType;
  product_id: string | null;
  product_variant_id: string | null;
  recipient_name: string | null;
  sender_name: string | null;
  special_date: string | null;
  message: string | null;
  letter: string | null;
  special_phrase: string | null;
  music_option: MusicOptionType;
  music_value: string | null;
  media_paths: string[];
  subtotal: number;
  delivery_cost: number;
  discount: number;
  total: number;
  coupon_code: string | null;
  status: OrderStatusType;
  payment_method: PaymentMethodType | null;
  notes: string | null;
  digital_experience_id: string | null;
  created_at: string;
  updated_at: string;
}

export type OrderItemRow = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_variant_id: string | null;
  description: string | null;
  quantity: number;
  unit_price: number;
  total: number;
  created_at: string;
}

export type PaymentRow = {
  id: string;
  order_id: string;
  method: PaymentMethodType;
  amount: number;
  status: PaymentStatusType;
  proof_url: string | null;
  validated_by: string | null;
  validated_at: string | null;
  created_at: string;
}

export type DeliveryAddressRow = {
  id: string;
  order_id: string;
  contact_name: string;
  phone: string;
  district: string;
  address: string;
  reference: string | null;
  delivery_date: string | null;
  delivery_time: string | null;
  delivery_cost: number;
  created_at: string;
}

export type DigitalExperienceRow = {
  id: string;
  order_id: string | null;
  code: string;
  slug: string;
  recipient_name: string;
  sender_name: string | null;
  intro_message: string;
  welcome_message: string | null;
  story: string | null;
  letter: string | null;
  final_message: string;
  cover_image_url: string | null;
  privacy: PrivacyLevelType;
  pin_hash: string | null;
  status: ExperienceStatusType;
  expires_at: string | null;
  save_forever: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export type ExperienceMediaRow = {
  id: string;
  experience_id: string;
  type: MediaKindType;
  url: string;
  caption: string | null;
  sort_order: number;
  created_at: string;
}

export type ExperienceMessageRow = {
  id: string;
  experience_id: string;
  section: "bienvenida" | "historia" | "carta" | "mensaje_final";
  title: string | null;
  content: string;
  sort_order: number;
  created_at: string;
}

export type ExperienceMusicRow = {
  id: string;
  experience_id: string;
  option: MusicOptionType;
  title: string | null;
  artist: string | null;
  url: string | null;
  spotify_embed_url: string | null;
  created_at: string;
}

export type CorporateLeadRow = {
  id: string;
  company: string;
  contact_name: string;
  position: string | null;
  email: string;
  phone: string;
  approx_quantity: number | null;
  budget: string | null;
  event_type: string | null;
  message: string | null;
  status: LeadStatusType;
  created_at: string;
}

export type CouponRow = {
  id: string;
  code: string;
  discount_type: CouponDiscountType;
  discount_value: number;
  expires_at: string | null;
  max_uses: number | null;
  used_count: number;
  active: boolean;
  created_at: string;
}

export type SettingsRow = {
  key: string;
  value: Record<string, unknown>;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: Table<ProfileRow, Partial<ProfileRow> & { id: string }>;
      products: Table<ProductRow, Partial<ProductRow> & { slug: string; name: string }>;
      product_variants: Table<ProductVariantRow, Partial<ProductVariantRow> & { product_id: string; name: string; price: number }>;
      orders: Table<OrderRow, Partial<OrderRow> & { order_number: string; customer_name: string; customer_phone: string }>;
      order_items: Table<OrderItemRow, Partial<OrderItemRow> & { order_id: string }>;
      payments: Table<PaymentRow, Partial<PaymentRow> & { order_id: string; method: PaymentMethodType; amount: number }>;
      delivery_addresses: Table<
        DeliveryAddressRow,
        Partial<DeliveryAddressRow> & { order_id: string; contact_name: string; phone: string; district: string; address: string }
      >;
      digital_experiences: Table<
        DigitalExperienceRow,
        Partial<DigitalExperienceRow> & { code: string; slug: string; recipient_name: string }
      >;
      experience_media: Table<ExperienceMediaRow, Partial<ExperienceMediaRow> & { experience_id: string; url: string }>;
      experience_messages: Table<
        ExperienceMessageRow,
        Partial<ExperienceMessageRow> & { experience_id: string; section: ExperienceMessageRow["section"]; content: string }
      >;
      experience_music: Table<ExperienceMusicRow, Partial<ExperienceMusicRow> & { experience_id: string }>;
      corporate_leads: Table<
        CorporateLeadRow,
        Partial<CorporateLeadRow> & { company: string; contact_name: string; email: string; phone: string }
      >;
      coupons: Table<CouponRow, Partial<CouponRow> & { code: string; discount_value: number }>;
      settings: Table<SettingsRow, Partial<SettingsRow> & { key: string }>;
    };
    Views: Record<string, never>;
    Functions: {
      generate_order_number: { Args: Record<string, never>; Returns: string };
      is_admin: { Args: Record<string, never>; Returns: boolean };
    };
  };
}
