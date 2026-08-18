import { formatCurrency } from "@/lib/format";

const items = [
  { d: "Cámara de seguridad", q: 4, p: 45, t: 180 },
  { d: "Cable UTP (m)", q: 50, p: 0.7, t: 35 },
  { d: "Mano de obra", q: 1, p: 100, t: 100 },
];

/** Vista simulada de una cotización profesional (PDF) para el hero. */
export function QuoteMockup() {
  return (
    <div className="relative mx-auto w-full max-w-md">
      {/* Tarjeta de "aceptada" flotante */}
      <div className="absolute -right-3 -top-4 z-20 hidden animate-float rounded-xl border border-ink-100 bg-white px-3.5 py-2.5 shadow-card sm:flex sm:items-center sm:gap-2">
        <span className="grid h-7 w-7 place-items-center rounded-full bg-accent-100 text-accent-600">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="m5 12 4.5 4.5L19 7" />
          </svg>
        </span>
        <div className="leading-tight">
          <p className="text-[11px] font-semibold text-ink-900">Aceptada</p>
          <p className="text-[10px] text-ink-500">hace 2 min</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-card">
        {/* Encabezado del documento */}
        <div className="flex items-start justify-between gap-4 bg-ink-900 px-6 py-5 text-white">
          <div>
            <p className="text-[11px] uppercase tracking-widest text-white/50">
              Cotización
            </p>
            <p className="mt-0.5 text-lg font-semibold">#0001</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold">Instalaciones RC</p>
            <p className="text-[11px] text-white/60">18 ago 2026</p>
          </div>
        </div>

        <div className="px-6 py-5">
          <div className="mb-4 flex items-center justify-between text-xs">
            <div>
              <p className="text-ink-400">Cliente</p>
              <p className="font-medium text-ink-900">Juan Pérez</p>
            </div>
            <div className="text-right">
              <p className="text-ink-400">Servicio</p>
              <p className="font-medium text-ink-900">Instalación de cámaras</p>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-ink-100">
            <table className="w-full text-left text-xs">
              <thead className="bg-ink-50 text-ink-500">
                <tr>
                  <th className="px-3 py-2 font-medium">Descripción</th>
                  <th className="px-2 py-2 text-center font-medium">Cant.</th>
                  <th className="px-3 py-2 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {items.map((it) => (
                  <tr key={it.d}>
                    <td className="px-3 py-2.5 text-ink-800">{it.d}</td>
                    <td className="px-2 py-2.5 text-center text-ink-500">
                      {it.q}
                    </td>
                    <td className="px-3 py-2.5 text-right font-medium text-ink-900">
                      {formatCurrency(it.t)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-end justify-between rounded-xl bg-brand-50 px-4 py-3">
            <span className="text-sm font-medium text-brand-800">Total</span>
            <span className="text-2xl font-bold tracking-tight text-brand-700">
              {formatCurrency(315)}
            </span>
          </div>
        </div>
      </div>

      {/* Chip "60s" flotante */}
      <div className="absolute -bottom-4 -left-3 z-20 hidden animate-float rounded-xl border border-ink-100 bg-white px-3.5 py-2.5 shadow-card [animation-delay:1.5s] sm:block">
        <p className="text-[11px] text-ink-500">Creada en</p>
        <p className="text-sm font-bold text-ink-900">52 segundos</p>
      </div>
    </div>
  );
}
