import type { ComponentType, SVGProps } from "react";

export function StatCard({
  label,
  value,
  icon: Icon,
  accent = false,
}: {
  label: string;
  value: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  accent?: boolean;
}) {
  return (
    <div className="card p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-ink-500">{label}</p>
        <span
          className={`grid h-8 w-8 place-items-center rounded-lg ${
            accent ? "bg-accent-100 text-accent-600" : "bg-brand-50 text-brand-600"
          }`}
        >
          <Icon width={16} height={16} />
        </span>
      </div>
      <p className="mt-3 text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">
        {value}
      </p>
    </div>
  );
}
