import type { AutomationRule, Order } from "./types";

// Evalúa la condición de una regla contra un pedido.
function matches(rule: AutomationRule, order: Order): boolean {
  const { field, op, value } = rule.when;
  let actual: string | number;
  switch (field) {
    case "total":
      actual = order.total;
      break;
    case "country":
      actual = order.customer.country;
      break;
    case "channel":
      actual = order.channel;
      break;
    case "method":
      actual = order.shipping.method;
      break;
    case "status":
      actual = order.status;
      break;
  }
  switch (op) {
    case "gt":
      return Number(actual) > Number(value);
    case "lt":
      return Number(actual) < Number(value);
    case "eq":
      return actual === value;
    case "neq":
      return actual !== value;
  }
}

export interface AppliedAutomation {
  ruleId: string;
  ruleName: string;
  effect: string;
}

// Aplica todas las reglas activas a un pedido (mutando el pedido) y devuelve el
// registro de lo aplicado. Incrementa el contador de disparos de cada regla.
export function applyAutomations(
  order: Order,
  rules: AutomationRule[]
): AppliedAutomation[] {
  const applied: AppliedAutomation[] = [];

  for (const rule of rules) {
    if (!rule.enabled) continue;
    if (!matches(rule, order)) continue;

    const { type, value } = rule.then;
    let effect = "";

    switch (type) {
      case "assign_carrier":
        if (order.shipping.carrier !== value) {
          order.shipping.carrier = value as Order["shipping"]["carrier"];
          effect = `Transportista asignado: ${value}`;
        }
        break;
      case "add_flag":
        if (!order.flags.includes(value)) {
          order.flags.push(value);
          effect = `Etiqueta añadida: ${value}`;
        }
        break;
      case "set_status":
        order.status = value as Order["status"];
        effect = `Estado cambiado a ${value}`;
        break;
      case "notify_customer":
        order.lastCustomerNotifiedAt = new Date().toISOString();
        order.timeline.push({
          at: new Date().toISOString(),
          status: order.status,
          note: `Aviso automático enviado al cliente (${value})`,
          channel: value === "email" ? "email" : "whatsapp",
        });
        effect = `Cliente notificado por ${value}`;
        break;
    }

    if (effect) {
      rule.timesTriggered += 1;
      applied.push({ ruleId: rule.id, ruleName: rule.name, effect });
    }
  }

  return applied;
}
