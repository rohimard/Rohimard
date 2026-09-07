// Tipos de dominio compartidos por toda la aplicación MOMENTIA.

export type Occasion =
  | "pareja"
  | "mama"
  | "cumpleanos"
  | "amistad"
  | "agradecimiento"
  | "empresa"
  | "otra";

export const OCCASIONS: { value: Occasion; label: string; emoji: string }[] = [
  { value: "pareja", label: "Pareja", emoji: "❤️" },
  { value: "mama", label: "Mamá", emoji: "👩" },
  { value: "cumpleanos", label: "Cumpleaños", emoji: "🎂" },
  { value: "amistad", label: "Amiga/o", emoji: "👯" },
  { value: "agradecimiento", label: "Agradecimiento", emoji: "🙏" },
  { value: "empresa", label: "Empresa", emoji: "🏢" },
  { value: "otra", label: "Otra ocasión", emoji: "✨" },
];

export type ProductSlug = "esencial" | "historia" | "corporate";

export interface ProductLine {
  slug: ProductSlug;
  name: string;
  eyebrow: string;
  phrase: string;
  description: string;
  priceFrom: number;
  featured?: boolean;
  includes: string[];
  accent: "rubi" | "borgona" | "dorado";
}

export type MusicOption = "cancion" | "playlist" | "spotify" | "sin_musica";

export type PrivacyLevel = "public" | "private" | "temporal";

export type OrderStatus =
  | "nuevo"
  | "pago_pendiente"
  | "confirmado"
  | "en_produccion"
  | "listo"
  | "enviado"
  | "entregado"
  | "cancelado";

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  nuevo: "Nuevo",
  pago_pendiente: "Pago pendiente",
  confirmado: "Confirmado",
  en_produccion: "En producción",
  listo: "Listo",
  enviado: "Enviado",
  entregado: "Entregado",
  cancelado: "Cancelado",
};

export const ORDER_STATUS_FLOW: OrderStatus[] = [
  "nuevo",
  "pago_pendiente",
  "confirmado",
  "en_produccion",
  "listo",
  "enviado",
  "entregado",
];

export interface ConfiguratorState {
  occasion: Occasion | null;
  productSlug: ProductSlug | null;
  recipientName: string;
  senderName: string;
  specialDate: string;
  message: string;
  letter: string;
  specialPhrase: string;
  mediaFiles: { name: string; url: string; path: string; type: "photo" | "video" }[];
  musicOption: MusicOption;
  musicValue: string;
  delivery: {
    contactName: string;
    phone: string;
    district: string;
    address: string;
    reference: string;
    deliveryDate: string;
    deliveryTime: string;
  };
}
