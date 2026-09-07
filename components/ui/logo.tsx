import Link from "next/link";
import { cn } from "@/lib/utils/cn";

export function Logo({ className, dark }: { className?: string; dark?: boolean }) {
  return (
    <Link
      href="/"
      className={cn(
        "font-serif text-2xl font-semibold tracking-wide",
        dark ? "text-blanco" : "text-borgona-700",
        className,
      )}
    >
      MOMENTIA
      <span className={cn("ml-0.5", dark ? "text-dorado-300" : "text-dorado-400")}>.</span>
    </Link>
  );
}
