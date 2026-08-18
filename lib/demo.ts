/**
 * Datos DEMO para la Fase 1.
 * Se muestran en el dashboard mientras no exista persistencia real.
 * En la Fase 2 se reemplazan por datos de Supabase.
 */

export type EstadoCotizacion = "pendiente" | "enviada" | "aceptada" | "rechazada";

export interface CotizacionDemo {
  id: string;
  folio: string;
  cliente: string;
  servicio: string;
  total: number;
  estado: EstadoCotizacion;
  fecha: string; // ISO
}

export const usuarioDemo = {
  nombre: "Carlos",
};

export const cotizacionesDemo: CotizacionDemo[] = [
  {
    id: "1",
    folio: "#0001",
    cliente: "Juan Pérez",
    servicio: "Instalación de cámaras",
    total: 315,
    estado: "pendiente",
    fecha: "2026-08-17",
  },
  {
    id: "2",
    folio: "#0002",
    cliente: "María López",
    servicio: "Reparación de fuga en cocina",
    total: 180,
    estado: "enviada",
    fecha: "2026-08-16",
  },
  {
    id: "3",
    folio: "#0003",
    cliente: "Ferretería El Tornillo",
    servicio: "Mantenimiento de aire acondicionado",
    total: 640,
    estado: "aceptada",
    fecha: "2026-08-14",
  },
  {
    id: "4",
    folio: "#0004",
    cliente: "Ana Torres",
    servicio: "Pintura de fachada",
    total: 950,
    estado: "aceptada",
    fecha: "2026-08-12",
  },
];

export interface EstadisticasDemo {
  creadas: number;
  enviadas: number;
  aceptadas: number;
  totalCotizado: number;
}

export const estadisticasDemo: EstadisticasDemo = {
  creadas: cotizacionesDemo.length,
  enviadas: cotizacionesDemo.filter((c) => c.estado !== "pendiente").length,
  aceptadas: cotizacionesDemo.filter((c) => c.estado === "aceptada").length,
  totalCotizado: cotizacionesDemo.reduce((sum, c) => sum + c.total, 0),
};

// Item precargado para la pantalla "Nueva cotización" (datos de demostración).
export interface ItemDemo {
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
}

export const itemsDemo: ItemDemo[] = [
  { descripcion: "Cámara de seguridad", cantidad: 4, precioUnitario: 45 },
  { descripcion: "Cable", cantidad: 50, precioUnitario: 0.7 },
  { descripcion: "Mano de obra", cantidad: 1, precioUnitario: 100 },
];

export const clienteDemo = {
  nombre: "Juan Pérez",
  telefono: "",
  email: "",
  direccion: "",
  servicio: "Instalación de cámaras de seguridad",
};
