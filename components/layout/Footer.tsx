"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Instagram, Facebook, MapPin, Truck, Music2 } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { siteConfig, buildWhatsAppUrl } from "@/lib/config/site";
import { FloralDivider } from "@/components/decorative/Ornaments";

const LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/como-funciona", label: "Cómo funciona" },
  { href: "/crear", label: "Crear mi Momentia" },
  { href: "/corporate", label: "Empresas" },
  { href: "/inspiracion", label: "Inspiración" },
  { href: "/corporate#contacto", label: "Contacto" },
];

export function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin") || pathname?.startsWith("/m/")) return null;

  return (
    <footer className="relative overflow-hidden bg-borgona-700 text-crema-50">
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-rubi-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-dorado-300/10 blur-3xl" />

      <div className="container-momentia relative py-16">
        <div className="grid gap-12 md:grid-cols-[1.3fr_1fr_1fr]">
          <div>
            <Logo dark />
            <p className="mt-4 max-w-xs font-script text-2xl text-dorado-200">
              &ldquo;{siteConfig.tagline}&rdquo;
            </p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-crema-100/80">
              Cajas de regalo personalizadas con una experiencia digital privada dentro.
              No regalamos cosas. Creamos momentos.
            </p>
          </div>

          <div>
            <h4 className="eyebrow !text-dorado-300">Explorar</h4>
            <ul className="mt-4 space-y-2.5">
              {LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-crema-100/85 transition-colors hover:text-dorado-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="eyebrow !text-dorado-300">Contacto</h4>
            <ul className="mt-4 space-y-3 text-sm text-crema-100/85">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-dorado-300" /> {siteConfig.location}
              </li>
              <li className="flex items-start gap-2">
                <Truck className="mt-0.5 h-4 w-4 shrink-0 text-dorado-300" /> {siteConfig.deliveryAreas}
              </li>
              <li>
                <a
                  href={buildWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-dorado-200 underline underline-offset-4"
                >
                  Hablar por WhatsApp
                </a>
              </li>
            </ul>
            <div className="mt-5 flex gap-3">
              <a
                href={siteConfig.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram de MOMENTIA"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-dorado-300/40 transition-colors hover:bg-dorado-300/10"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href={siteConfig.social.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok de MOMENTIA"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-dorado-300/40 transition-colors hover:bg-dorado-300/10"
              >
                <Music2 className="h-4 w-4" />
              </a>
              <a
                href={siteConfig.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook de MOMENTIA"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-dorado-300/40 transition-colors hover:bg-dorado-300/10"
              >
                <Facebook className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        <FloralDivider className="my-10 opacity-60" />

        <div className="flex flex-col items-center justify-between gap-3 text-xs text-crema-100/60 sm:flex-row">
          <p>© {new Date().getFullYear()} MOMENTIA. Todos los derechos reservados.</p>
          <p>Hecho con ❤️ en {siteConfig.location}</p>
        </div>
      </div>
    </footer>
  );
}
