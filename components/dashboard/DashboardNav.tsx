"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { signOutAction } from "@/lib/actions/auth";
import {
  IconHome,
  IconList,
  IconPlus,
  IconSettings,
  IconUser,
} from "@/components/ui/icons";

const nav = [
  { href: "/dashboard", label: "Inicio", icon: IconHome, exact: true },
  { href: "/dashboard/cotizaciones", label: "Cotizaciones", icon: IconList },
  { href: "/dashboard/clientes", label: "Clientes", icon: IconUser },
  {
    href: "/dashboard/configuracion",
    label: "Configuración",
    icon: IconSettings,
  },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  return exact ? pathname === href : pathname.startsWith(href);
}

/** Barra lateral fija — solo desktop. */
export function DashboardSidebar({
  userName,
  businessName,
}: {
  userName: string;
  businessName: string;
}) {
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
          <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-50 text-brand-600">
            <IconUser width={18} height={18} />
          </span>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-medium text-ink-900">
              {userName || "Mi cuenta"}
            </p>
            <p className="truncate text-xs text-ink-400">
              {businessName || "Plan gratuito"}
            </p>
          </div>
        </div>
        <form action={signOutAction}>
          <button
            type="submit"
            className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-ink-500 hover:bg-ink-50 hover:text-ink-900"
          >
            <IconArrowOut />
            Cerrar sesión
          </button>
        </form>
      </div>
    </aside>
  );
}

/** Encabezado superior — solo móvil/tablet. */
export function DashboardTopbar({ userName }: { userName: string }) {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-ink-100 bg-white/90 px-4 backdrop-blur lg:hidden">
      <Logo href="/dashboard" />
      <Link
        href="/dashboard/configuracion"
        className="flex items-center gap-2 rounded-full bg-ink-50 py-1 pl-1 pr-3"
        aria-label="Configuración"
      >
        <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-50 text-brand-600">
          <IconUser width={16} height={16} />
        </span>
        <span className="max-w-[120px] truncate text-sm font-medium text-ink-700">
          {userName || "Mi cuenta"}
        </span>
      </Link>
    </header>
  );
}

/** Navegación inferior — solo móvil/tablet. */
export function DashboardBottomNav() {
  const pathname = usePathname();
  const items = [
    { href: "/dashboard", label: "Inicio", icon: IconHome, exact: true },
    { href: "/dashboard/cotizaciones", label: "Cotiz.", icon: IconList },
    {
      href: "/dashboard/cotizaciones/nueva",
      label: "Nueva",
      icon: IconPlus,
      highlight: true,
    },
    { href: "/dashboard/clientes", label: "Clientes", icon: IconUser },
    {
      href: "/dashboard/configuracion",
      label: "Ajustes",
      icon: IconSettings,
    },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-100 bg-white/95 backdrop-blur lg:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5">
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
                <span className="-mt-2 text-[10px] font-medium text-brand-700">
                  {item.label}
                </span>
              </Link>
            );
          }
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium ${
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

function IconArrowOut() {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 12H3M9 8l-4 4 4 4" />
      <path d="M13 4h6a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-6" />
    </svg>
  );
}
