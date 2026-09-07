"use client";

import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { buildWhatsAppUrl } from "@/lib/config/site";

export function WhatsAppButton() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin") || pathname?.startsWith("/m/")) return null;

  return (
    <a
      href={buildWhatsAppUrl()}
      target="_blank"
      rel="noopener noreferrer"
      className="group fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-[#25D366] py-3 pl-3 pr-3 text-white shadow-[0_10px_30px_-8px_rgba(37,211,102,0.6)] transition-all hover:pr-5 sm:bottom-7 sm:right-7"
      aria-label="¿Creamos tu Momentia? Escríbenos por WhatsApp"
    >
      <MessageCircle className="h-6 w-6 shrink-0" fill="white" />
      <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-semibold transition-all duration-300 group-hover:max-w-[160px]">
        ¿Creamos tu Momentia?
      </span>
    </a>
  );
}
