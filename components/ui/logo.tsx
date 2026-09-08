import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { LogoMark } from "@/components/ui/logo-mark";

export function Logo({ className, dark }: { className?: string; dark?: boolean }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2.5", className)}>
      <LogoMark dark={dark} className="h-9 w-9 shrink-0" />
      <span
        className={cn(
          "font-serif text-xl font-semibold tracking-wide sm:text-2xl",
          dark ? "text-blanco" : "text-borgona-700",
        )}
      >
        MOMENTIA
        <span className={cn("ml-0.5", dark ? "text-dorado-300" : "text-dorado-400")}>.</span>
      </span>
    </Link>
  );
}
