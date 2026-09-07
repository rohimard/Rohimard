"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/como-funciona", label: "Cómo funciona" },
  { href: "/productos", label: "Productos" },
  { href: "/inspiracion", label: "Inspiración" },
  { href: "/corporate", label: "Empresas" },
];

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const isHidden = pathname?.startsWith("/admin") || pathname?.startsWith("/m/");
  if (isHidden) return null;

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-all duration-300",
        scrolled ? "bg-blanco/90 shadow-soft backdrop-blur-md" : "bg-transparent",
      )}
    >
      <div className="container-momentia flex h-20 items-center justify-between">
        <Logo />

        <nav className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium tracking-wide text-ink/70 transition-colors hover:text-borgona-700",
                pathname === link.href && "text-borgona-700",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Button asChild variant="secondary" size="sm">
            <Link href="/m/demo">Ver experiencia</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/crear">Crear mi Momentia</Link>
          </Button>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="rounded-full p-2 text-borgona-700 lg:hidden"
          aria-label="Abrir menú"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-dorado-200/50 bg-blanco lg:hidden">
          <nav className="container-momentia flex flex-col gap-1 py-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-lg px-3 py-3 text-base font-medium text-ink/80 transition-colors hover:bg-borgona-50 hover:text-borgona-700",
                  pathname === link.href && "bg-borgona-50 text-borgona-700",
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-3 flex flex-col gap-2 px-3">
              <Button asChild variant="secondary">
                <Link href="/m/demo">Ver experiencia</Link>
              </Button>
              <Button asChild>
                <Link href="/crear">Crear mi Momentia</Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
