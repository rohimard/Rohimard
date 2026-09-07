import Link from "next/link";

export function Logo({
  className = "",
  withTagline = false,
}: {
  className?: string;
  withTagline?: boolean;
}) {
  return (
    <Link href="/" className={`inline-flex flex-col items-center ${className}`}>
      <span className="flex items-center gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-full border border-gold-400 font-serif text-lg font-bold text-maroon-600">
          M
        </span>
        <span className="font-serif text-xl font-bold tracking-wide text-maroon-600">
          MOMENTIA
        </span>
      </span>
      {withTagline && (
        <span className="mt-1 text-[11px] uppercase tracking-[0.2em] text-ink-500">
          Regalos que continúan después de abrirlos
        </span>
      )}
    </Link>
  );
}
