import { cn } from "@/lib/utils/cn";

/**
 * Monograma "M" de MOMENTIA: aro fino dorado, iniciales en Playfair Display
 * y pequeñas florituras — inspirado en el tablero de marca del cliente.
 */
export function LogoMark({ className, dark }: { className?: string; dark?: boolean }) {
  const ring = dark ? "#E6D3B8" : "#C8A57A";
  const mColor = dark ? "#FFF9F5" : "#6B0F1A";

  return (
    <svg viewBox="0 0 64 64" className={cn("h-8 w-8", className)} aria-hidden>
      <circle cx="32" cy="32" r="29.5" fill="none" stroke={ring} strokeWidth="1.1" />
      <circle cx="32" cy="32" r="25.5" fill="none" stroke={ring} strokeWidth="0.6" opacity="0.6" />

      {/* florituras */}
      <path
        d="M14 32c-3-2-4.5-1-6-3M50 32c3-2 4.5-1 6-3"
        stroke={ring}
        strokeWidth="1"
        strokeLinecap="round"
        fill="none"
        opacity="0.85"
      />
      <path d="M32 8c-1.5 2-1 3.5-3 5M32 8c1.5 2 1 3.5 3 5" stroke={ring} strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.85" />
      <circle cx="32" cy="12.5" r="1.1" fill={ring} />

      <text
        x="32"
        y="42"
        textAnchor="middle"
        fontFamily="Georgia, 'Playfair Display', serif"
        fontSize="26"
        fontWeight="600"
        fill={mColor}
      >
        M
      </text>
    </svg>
  );
}
