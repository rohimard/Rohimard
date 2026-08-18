"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import {
  IconHome,
  IconList,
  IconPlus,
  IconSettings,
  IconUser,
} from "@/components/ui/icons";

const nav = [
  { href: "/dashboard", label: "Inicio", icon: IconHome, exact: true },
  {
    href: "/dashboard/cotizaciones/nueva",
    label: "Cotizaciones",
    icon: IconList,
  },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  return exact ? pathname === href : pathname.startsWith(href);
}

/** Barra lateral fija — solo desktop. */
export function DashboardSidebar() {
  const pathname = usePathname();
  return (
    <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-ink-100 bg-white lg:flex">
      <div className="flex h-16 items-center border-b border-ink-100 px-6">
        <Logo href="/dashboard" />
      </div>

      <div className="px-4 py-5">
        <Link href="/dashboard/cotizaciones/nueva" className="btn-primary w-full">
          <IconPlus width={18} height={18} />
          Nueva cotización
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-4">
        {nav.map((item) => {
          const active = isActive(pathname, item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-brand-50 text-brand-700"
                  : "text-ink-600 hover:bg-ink-50 hover:text-ink-900"
              }`}
            >
              <item.icon width={18} height={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-ink-100 p-4">
        <div className="flex items-center gap-3 rounded-xl px-2 py-2">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-ink-100 text-ink-500">
            <IconUser width={18} height={18} />
          </span>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-medium text-ink-900">Carlos</p>
            <p className="truncate text-xs text-ink-400">Plan gratuito</p>
          </div>
        </div>
        <Link
          href="/"
          className="mt-1 flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-ink-500 hover:bg-ink-50 hover:text-ink-900"
        >
          <IconSettings width={18} height={18} />
          Cerrar sesión
        </Link>
      </div>
    </aside>
  );
}

/** Encabezado superior — solo móvil/tablet. */
export function DashboardTopbar() {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-ink-100 bg-white/90 px-4 backdrop-blur lg:hidden">
      <Logo href="/dashboard" />
      <span className="grid h-9 w-9 place-items-center rounded-full bg-ink-100 text-ink-500">
        <IconUser width={18} height={18} />
      </span>
    </header>
  );
}

/** Navegación inferior — solo móvil/tablet. */
export function DashboardBottomNav() {
  const pathname = usePathname();
  const items = [
    { href: "/dashboard", label: "Inicio", icon: IconHome, exact: true },
    {
      href: "/dashboard/cotizaciones/nueva",
      label: "Nueva",
      icon: IconPlus,
      highlight: true,
    },
    { href: "/", label: "Salir", icon: IconSettings },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-100 bg-white/95 backdrop-blur lg:hidden">
      <div className="mx-auto grid max-w-md grid-cols-3">
        {items.map((item) => {
          const active =
            !item.highlight && isActive(pathname, item.href, item.exact);
          if (item.highlight) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center py-2"
              >
                <span className="grid h-11 w-11 -translate-y-3 place-items-center rounded-full bg-brand-600 text-white shadow-glow">
                  <item.icon width={22} height={22} />
                </span>
                <span className="-mt-2 text-[11px] font-medium text-brand-700">
                  {item.label}
                </span>
              </Link>
            );
          }
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium ${
                active ? "text-brand-700" : "text-ink-400"
              }`}
            >
              <item.icon width={20} height={20} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
