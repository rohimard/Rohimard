/**
 * Configuración central de la marca MOMENTIA.
 * Todo lo que puede variar por entorno (redes, WhatsApp, dominio) vive aquí,
 * leído desde variables de entorno con valores de respaldo razonables.
 */

export const siteConfig = {
  name: "MOMENTIA",
  tagline: "Regalos que continúan después de abrirlos.",
  description:
    "Transformamos recuerdos, palabras y emociones en una experiencia que puedes tocar… y volver a vivir. Cajas de regalo personalizadas con experiencia digital privada por código QR.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://momentia.pe",
  locale: "es_PE",
  currency: "PEN",
  currencySymbol: "S/",
  location: "Lima, Perú",
  deliveryAreas: "Lima, Callao y envíos a todo el Perú según disponibilidad.",
  whatsapp: {
    number: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "51999999999",
    defaultMessage: "Hola, quiero crear una experiencia MOMENTIA ❤️",
  },
  social: {
    instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? "https://instagram.com/momentia.pe",
    instagramHandle: "@momentia.pe",
    tiktok: process.env.NEXT_PUBLIC_TIKTOK_URL ?? "https://tiktok.com/@momentia.pe",
    facebook: process.env.NEXT_PUBLIC_FACEBOOK_URL ?? "https://facebook.com/momentia.pe",
  },
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hola@momentia.pe",
} as const;

export function buildWhatsAppUrl(customMessage?: string) {
  const message = encodeURIComponent(customMessage ?? siteConfig.whatsapp.defaultMessage);
  return `https://wa.me/${siteConfig.whatsapp.number}?text=${message}`;
}
