export interface DeliveryZone {
  district: string;
  cost: number;
}

// Fallback usado cuando Supabase no está configurado o la tabla `settings`
// todavía no tiene el registro `delivery`. El panel admin permite editar esto
// en producción (tabla `settings`, key = "delivery").
export const DEFAULT_DELIVERY_ZONES: DeliveryZone[] = [
  { district: "Lima (zonas céntricas)", cost: 12 },
  { district: "Lima (zonas periféricas)", cost: 18 },
  { district: "Callao", cost: 15 },
  { district: "Provincia (courier)", cost: 25 },
];

export const FREE_DELIVERY_ABOVE = 250;

export function getDeliveryCost(district: string, subtotal: number, zones: DeliveryZone[] = DEFAULT_DELIVERY_ZONES) {
  if (subtotal >= FREE_DELIVERY_ABOVE) return 0;
  const zone = zones.find((z) => z.district === district);
  return zone ? zone.cost : zones[zones.length - 1]?.cost ?? 15;
}
