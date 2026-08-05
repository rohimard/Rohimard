# 🐙 Pulpo — Gestión de pedidos para ecommerce

Pulpo centraliza los pedidos de una tienda online que vende en **varios canales**
(Shopify, WooCommerce, Amazon, Mercado Libre, Instagram) en una sola bandeja, y
ataca los puntos de dolor más caros del día a día de un ecommerce:

| Punto débil del ecommerce | Cómo lo ataca Pulpo |
|---|---|
| El pedido vive en 5 sitios y ninguno cuadra | **Bandeja unificada multicanal** con estado real y único |
| El 30–50% del soporte es «¿dónde está mi pedido?» (WISMO) | **Tracking proactivo**: avisos automáticos por WhatsApp/email + timeline por pedido |
| Devoluciones manuales y lentas | **Gestión de devoluciones** con flujo de estados |
| Trabajo manual repetitivo | **Motor de automatizaciones** (reglas SI → ENTONCES) |
| Falta de visibilidad | **Panel** con KPIs, incidencias y reparto por canal |

Este repositorio es un **MVP funcional** con datos de ejemplo realistas y
persistencia local en fichero (sin dependencias externas), pensado para validar
el producto y demostrar el flujo completo.

## Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS**
- Persistencia sencilla en JSON (`.data/db.json`) — en producción se
  reemplazaría por Postgres/Prisma y conectores reales a cada canal.

## Arrancar en local

```bash
npm install
npm run dev
# abre http://localhost:3000
```

Para compilar y servir en producción:

```bash
npm run build
npm start
```

## Estructura

```
app/
  page.tsx                 Panel (KPIs, incidencias, canales, recientes)
  pedidos/                 Bandeja unificada + detalle con timeline y acciones
  devoluciones/            Gestión de devoluciones
  automatizaciones/        Reglas SI → ENTONCES (activar/desactivar)
  api/                     Endpoints que mutan el estado
lib/
  types.ts                 Modelo de dominio
  seed.ts                  Datos de ejemplo
  db.ts                    Persistencia
  automations.ts           Motor de reglas
  orderFlow.ts             Ciclo de vida logístico del pedido
  metrics.ts               KPIs del panel
```

## Qué es demostrable hoy

- Ver todos los pedidos filtrando por canal, estado o cliente.
- Avanzar un pedido por su ciclo logístico; al hacerlo se **disparan las
  automatizaciones** (asignar transportista, etiquetar, avisar al cliente).
- Enviar un aviso proactivo al cliente y verlo reflejado en el timeline.
- Gestionar el ciclo de una devolución (solicitada → aprobada → recibida →
  reembolsada).
- Activar/desactivar reglas de automatización.

Reiniciar los datos de demo: `POST /api/reset`.

## Próximos pasos (roadmap)

1. **Conectores reales**: OAuth con Shopify/Woo + APIs de marketplaces.
2. **Webhooks de transportistas** para actualizar el tracking sin polling.
3. **Portal de autoservicio de devoluciones** para el cliente final.
4. **Notificaciones reales** (WhatsApp Business API / email transaccional).
5. **Sincronización de inventario** para evitar sobreventa.
6. Autenticación multi-tienda y facturación.
