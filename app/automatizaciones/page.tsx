import { getDb } from "@/lib/db";
import AutomationToggle from "@/components/AutomationToggle";

export const dynamic = "force-dynamic";

const fieldLabel: Record<string, string> = {
  total: "importe",
  country: "país",
  channel: "canal",
  method: "método de envío",
  status: "estado",
};

const opLabel: Record<string, string> = {
  gt: "es mayor que",
  lt: "es menor que",
  eq: "es igual a",
  neq: "es distinto de",
};

export default function AutomatizacionesPage() {
  const db = getDb();
  const rules = db.automations;
  const activas = rules.filter((r) => r.enabled).length;
  const totalDisparos = rules.reduce((s, r) => s + r.timesTriggered, 0);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Automatizaciones</h1>
        <p className="mt-1 text-sm text-slate-500">
          {activas} reglas activas · {totalDisparos} acciones ejecutadas automáticamente
        </p>
      </header>

      <p className="rounded-lg bg-brand-50 px-4 py-3 text-sm text-brand-800">
        Las reglas se evalúan sobre cada pedido cuando cambia de estado. Así eliminas trabajo
        manual: asignar transportista, etiquetar, avisar al cliente o marcar incidencias sin tocar
        nada.
      </p>

      <div className="space-y-3">
        {rules.map((r) => (
          <div key={r.id} className="card flex items-start gap-4 p-5">
            <div className="pt-0.5">
              <AutomationToggle ruleId={r.id} enabled={r.enabled} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold text-slate-800">{r.name}</h3>
                {r.timesTriggered > 0 && (
                  <span className="badge bg-slate-100 text-slate-500">
                    {r.timesTriggered}× ejecutada
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-slate-500">{r.description}</p>
              <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
                <span className="rounded bg-slate-100 px-2 py-1 text-slate-600">
                  <span className="text-slate-400">SI</span> {fieldLabel[r.when.field]}{" "}
                  {opLabel[r.when.op]} <strong>{String(r.when.value)}</strong>
                </span>
                <span className="text-slate-300">→</span>
                <span className="rounded bg-brand-50 px-2 py-1 text-brand-700">
                  {r.then.type === "assign_carrier" && `asignar ${r.then.value}`}
                  {r.then.type === "add_flag" && `etiquetar «${r.then.value}»`}
                  {r.then.type === "notify_customer" && `avisar cliente por ${r.then.value}`}
                  {r.then.type === "set_status" && `cambiar estado a ${r.then.value}`}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
