import type { ProductLine } from "@/lib/types";

// Contenido oficial de las 3 líneas de producto MOMENTIA.
// Sirve como fuente de verdad visual del sitio público; el panel admin
// gestiona precios/disponibilidad reales sobre la tabla `products` en Supabase.
export const PRODUCT_LINES: ProductLine[] = [
  {
    slug: "esencial",
    name: "Momentia Esencial",
    eyebrow: "Para empezar a sorprender",
    phrase: "Pequeños detalles. Grandes emociones.",
    description:
      "La forma más sencilla de decir lo que sientes: una caja cuidada, un detalle físico y una mini experiencia digital que se descubre al escanear un QR.",
    priceFrom: 89,
    accent: "rubi",
    includes: [
      "Caja personalizada",
      "Taza personalizada",
      "Chocolates",
      "Tarjeta",
      "Fotografía",
      "Decoración",
      "Código QR",
      "Mini experiencia digital",
    ],
  },
  {
    slug: "historia",
    name: "Momentia Historia",
    eyebrow: "Producto estrella",
    phrase: "Tu historia merece ser contada.",
    description:
      "La experiencia MOMENTIA completa: caja premium, carta personalizada, álbum digital, video y playlist. Todo lo que hace que un regalo continúe después de abrirlo.",
    priceFrom: 139,
    featured: true,
    accent: "borgona",
    includes: [
      "Caja premium",
      "Producto personalizado",
      "Chocolates",
      "Fotografías",
      "Carta personalizada",
      "Detalle especial",
      "Código QR",
      "Álbum digital",
      "Video",
      "Playlist",
    ],
  },
  {
    slug: "corporate",
    name: "Momentia Corporate",
    eyebrow: "Para empresas",
    phrase: "Regalos que fortalecen equipos.",
    description:
      "Experiencias personalizadas para colaboradores y clientes: cumpleaños, reconocimientos, bienvenidas, aniversarios, navidad y eventos corporativos.",
    priceFrom: 89,
    accent: "dorado",
    includes: [
      "Cumpleaños de colaboradores",
      "Reconocimientos",
      "Bienvenida",
      "Aniversarios",
      "Clientes especiales",
      "Navidad",
      "Eventos corporativos",
    ],
  },
];

export function getProductBySlug(slug: string) {
  return PRODUCT_LINES.find((p) => p.slug === slug);
}
