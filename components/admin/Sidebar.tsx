"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, Package, Sparkles, ShoppingBag, Ticket, Settings, LogOut, Menu, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils/cn";

const LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingBag },
  { href: "/admin/experiencias", label: "Experiencias", icon: Sparkles },
  { href: "/admin/productos", label: "Productos", icon: Package },
  { href: "/admin/cupones", label: "Cupones", icon: Ticket },
  { href: "/admin/configuracion", label: "Configuración", icon: Settings },
];

export function AdminSidebar({ email }: { email: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/admin/login";
  }

  const content = (
    <div className="flex h-full flex-col">
      <div className="border-b border-dorado-200/20 p-6">
        <Logo dark />
        <p className="mt-1 text-xs text-crema-100/50">{email}</p>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {LINKS.map((link) => {
          const active = pathname === link.href || (link.href !== "/admin" && pathname?.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active ? "bg-dorado-300/15 text-dorado-200" : "text-crema-100/70 hover:bg-blanco/5 hover:text-crema-50",
              )}
            >
              <link.icon className="h-4 w-4" /> {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-dorado-200/20 p-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-crema-100/70 transition-colors hover:bg-blanco/5 hover:text-rosa-200"
        >
          <LogOut className="h-4 w-4" /> Cerrar sesión
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden w-64 shrink-0 bg-borgona-800 lg:block">{content}</aside>

      <div className="flex items-center justify-between border-b border-dorado-200/20 bg-borgona-800 px-4 py-3 lg:hidden">
        <Logo dark />
        <button onClick={() => setOpen((v) => !v)} className="text-crema-50" aria-label="Menú">
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      {open && <div className="bg-borgona-800 lg:hidden">{content}</div>}
    </>
  );
}
