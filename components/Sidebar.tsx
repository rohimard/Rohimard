"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "Panel", icon: "◧" },
  { href: "/pedidos", label: "Pedidos", icon: "▤" },
  { href: "/devoluciones", label: "Devoluciones", icon: "⇆" },
  { href: "/automatizaciones", label: "Automatizaciones", icon: "⚡" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-60 flex-shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="flex items-center gap-2 px-5 py-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-lg font-bold text-white">
          🐙
        </span>
        <div>
          <div className="text-base font-bold leading-tight text-slate-900">Pulpo</div>
          <div className="text-[11px] leading-tight text-slate-400">Gestión de pedidos</div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {items.map((it) => {
          const active =
            it.href === "/" ? pathname === "/" : pathname.startsWith(it.href);
          return (
            <Link
              key={it.href}
              href={it.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-brand-50 text-brand-700"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span className="w-4 text-center text-slate-400">{it.icon}</span>
              {it.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-100 px-5 py-4 text-[11px] text-slate-400">
        <div className="mb-1 font-semibold text-slate-500">Canales conectados</div>
        <div className="flex flex-wrap gap-1">
          {["Shopify", "WooCommerce", "Amazon", "ML", "Instagram"].map((c) => (
            <span key={c} className="rounded bg-slate-100 px-1.5 py-0.5">
              {c}
            </span>
          ))}
        </div>
      </div>
    </aside>
  );
}
