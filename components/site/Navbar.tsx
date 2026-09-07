"use client";

import Link from "next/link";
import { useState } from "react";
import { Logo } from "@/components/ui/Logo";
import { IconClose, IconMenu } from "@/components/ui/icons";

const links = [
  { href: "/tienda", label: "Tienda" },
  { href: "/#experiencia-digital", label: "Experiencia digital" },
  { href: "/#como-funciona", label: "Cómo funciona" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-maroon-100/70 bg-cream-50/90 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between">
        <Logo />

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-ink-700 transition-colors hover:text-maroon-600"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          <Link href="/crear" className="btn-primary">
            Crear mi regalo
          </Link>
        </div>

        <button
          type="button"
          className="grid h-10 w-10 place-items-center rounded-full text-maroon-700 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Abrir menú"
        >
          {open ? <IconClose /> : <IconMenu />}
        </button>
      </div>

      {open && (
        <div className="border-t border-maroon-100/70 bg-cream-50 md:hidden">
          <nav className="container-page flex flex-col gap-1 py-3">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-2.5 text-sm font-medium text-ink-700 hover:bg-maroon-50"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/crear"
              onClick={() => setOpen(false)}
              className="btn-primary mt-2"
            >
              Crear mi regalo
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
