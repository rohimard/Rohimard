import type { Channel, OrderStatus, ReturnStatus } from "@/lib/types";
import {
  canalColor,
  canalLabel,
  estadoColor,
  estadoLabel,
  devolucionColor,
  devolucionLabel,
} from "@/lib/format";

export function CanalBadge({ channel }: { channel: Channel }) {
  return <span className={`badge ${canalColor[channel]}`}>{canalLabel[channel]}</span>;
}

export function EstadoBadge({ status }: { status: OrderStatus }) {
  return <span className={`badge ${estadoColor[status]}`}>{estadoLabel[status]}</span>;
}

export function DevolucionBadge({ status }: { status: ReturnStatus }) {
  return <span className={`badge ${devolucionColor[status]}`}>{devolucionLabel[status]}</span>;
}
