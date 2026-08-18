import Link from "next/link";

export function Logo({
  href = "/",
  className = "",
  compact = false,
}: {
  href?: string;
  className?: string;
  compact?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2.5 font-semibold text-ink-900 ${className}`}
      aria-label="CotizaPro"
    >
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-white shadow-soft">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M13 2 4.5 13.5H11l-1 8.5L19.5 10H13l0-8Z"
            fill="currentColor"
          />
        </svg>
      </span>
      {!compact && (
        <span className="text-lg tracking-tight">
          Cotiza<span className="text-brand-600">Pro</span>
        </span>
      )}
    </Link>
  );
}
