import { cn } from "@/lib/utils/cn";

/** Línea con floritura central — separador editorial sutil. */
export function FloralDivider({ className }: { className?: string }) {
  return (
    <div className={cn("mx-auto flex w-40 items-center justify-center gap-3", className)} aria-hidden>
      <span className="h-px flex-1 bg-gradient-to-r from-transparent to-dorado-300" />
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-dorado-400">
        <path
          d="M12 2c1 3-1 5-1 5s3-1 5 1-1 5-1 5 3-1 4 2-3 4-3 4-1-3-4-3-2 3-4 3-4-3-3-4 4-1 4-2-3-3-3-5 4-2 5-1-2-3-1-5-1-3 1-5-3 1-4-1 3-4 3-4 1 3 4 3 2-3 4-3 4 3 3 4-4 1-4 2 3 3 3 5-4 2-5 1z"
          fill="currentColor"
          opacity="0.35"
        />
      </svg>
      <span className="h-px flex-1 bg-gradient-to-l from-transparent to-dorado-300" />
    </div>
  );
}

/** Corazón fino trazado a mano — usar con moderación. */
export function HeartLine({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 22" fill="none" className={cn("h-4 w-4", className)} aria-hidden>
      <path
        d="M12 20.5S1.5 13.9 1.5 6.9C1.5 3.4 4.2 1 7.3 1c1.9 0 3.7 1 4.7 2.6C13 1.9 14.8 1 16.7 1c3.1 0 5.8 2.4 5.8 5.9 0 7-10.5 13.6-10.5 13.6Z"
        stroke="currentColor"
        strokeWidth="1.3"
      />
    </svg>
  );
}

/** Marco fino ornamental para envolver bloques destacados. */
export function ThinFrame({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-3 rounded-2xl border border-dorado-200/60",
        className,
      )}
      aria-hidden
    />
  );
}

export function SparklesDot({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn("h-3.5 w-3.5", className)} aria-hidden>
      <path d="M12 2l1.6 6.4L20 10l-6.4 1.6L12 18l-1.6-6.4L4 10l6.4-1.6L12 2z" fill="currentColor" />
    </svg>
  );
}
