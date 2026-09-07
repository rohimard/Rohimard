/** Rutas propias del sitio que nunca deben tratarse como slug de experiencia. */
export const RESERVED_SLUGS = new Set([
  "tienda",
  "crear",
  "nosotros",
  "contacto",
  "como-funciona",
  "api",
  "admin",
  "favicon.ico",
  "robots.txt",
  "sitemap.xml",
]);

/** Convierte un nombre ("Ana María") en un slug de URL ("ana-maria"). */
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // quita tildes
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9-]{2,40}$/.test(slug) && !RESERVED_SLUGS.has(slug);
}
