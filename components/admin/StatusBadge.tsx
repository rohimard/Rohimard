import { Badge } from "@/components/ui/badge";
import { ORDER_STATUS_LABEL, type OrderStatus } from "@/lib/types";

const VARIANT: Record<OrderStatus, "default" | "warning" | "success" | "danger" | "outline" | "gold" | "rose"> = {
  nuevo: "default",
  pago_pendiente: "warning",
  confirmado: "gold",
  en_produccion: "rose",
  listo: "gold",
  enviado: "default",
  entregado: "success",
  cancelado: "danger",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge variant={VARIANT[status]}>{ORDER_STATUS_LABEL[status]}</Badge>;
}
