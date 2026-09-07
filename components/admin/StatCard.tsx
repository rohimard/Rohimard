import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function StatCard({
  icon: Icon,
  label,
  value,
  accent = "borgona",
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  accent?: "borgona" | "dorado" | "rubi";
}) {
  const accentClasses = {
    borgona: "bg-borgona-50 text-borgona-700",
    dorado: "bg-dorado-50 text-dorado-500",
    rubi: "bg-rubi-50 text-rubi-600",
  } as const;

  return (
    <div className="card-premium p-6">
      <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", accentClasses[accent])}>
        <Icon className="h-5 w-5" strokeWidth={1.7} />
      </div>
      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-ink/50">{label}</p>
      <p className="heading-display mt-1 text-2xl">{value}</p>
    </div>
  );
}
