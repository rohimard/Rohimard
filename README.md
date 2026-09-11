# CotizaPro

Micro-SaaS para trabajadores independientes y pequeños negocios (electricistas,
plomeros, técnicos, pintores, fotógrafos, jardineros…) que permite **crear una
cotización profesional en menos de 60 segundos**, generar un PDF y compartirla
con el cliente.

> Flujo del producto: **Crear cotización → Generar PDF → Compartir → Seguimiento**

## Desplegar en 1 clic

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Frohimard%2FRohimard%2Ftree%2Fclaude%2Fcotizapro-initial-phase-lk7k6k&project-name=cotizapro&repository-name=cotizapro)

Pulsa el botón, inicia sesión con GitHub y Vercel clona el proyecto y lo publica
con una URL pública en ~1 minuto. **No necesitas configurar nada** (arranca en
modo demo). Detalles en [`DEPLOY.md`](./DEPLOY.md).

## Estado: Fase 3 (asistente de IA y planes)

La app funciona con **usuarios y datos reales** cuando Supabase está configurado,
y conserva un **modo demo** como fallback cuando no lo está.

- ✅ Landing page (hero, problema, solución, cómo funciona, CTA)
- ✅ Sistema de diseño (Tailwind + tokens de marca)
- ✅ **Supabase Auth real** en login y registro (+ modo demo)
- ✅ **Base de datos PostgreSQL** con RLS (`profiles`, `clients`, `quotes`, `quote_items`)
- ✅ **Protección de rutas** con middleware (`/dashboard/*` requiere sesión)
- ✅ Perfil del negocio (`/dashboard/configuracion`)
- ✅ Clientes: crear, editar, eliminar, buscar (`/dashboard/clientes`)
- ✅ Cotizaciones reales: crear, guardar, numeración única, listar y ver detalle
- ✅ Dashboard con estadísticas y cotizaciones **reales** (+ estado vacío)
- ✅ Responsive (prioridad móvil: 360 / 390 / 412 px, tablet y desktop)
- ✅ **Asistente "Cotiza con IA"** (Hugging Face): describes el trabajo en una
  frase y devuelve los ítems con cantidades y precios sugeridos
- ✅ **Cuota mensual por plan** (`free` / `pro`) con consumo atómico en la base
  de datos y devolución del crédito si falla el proveedor
- ✅ **Página de precios** (`/precios`) con enlace de pago configurable

> **Migraciones SQL** en `supabase/migrations/` — ver [`supabase/README.md`](./supabase/README.md).

## Cómo funciona el asistente de IA

```
Usuario describe el trabajo
  → consume_ai_credit()        (Supabase, atómico: no se puede saltar la cuota)
  → router.huggingface.co/v1   (chat completions, compatible con OpenAI)
  → JSON saneado y validado    (descripción + ítems + notas)
  → se vuelca en el formulario (el usuario ajusta y guarda)
```

Si el proveedor falla, `refund_ai_credit()` devuelve el crédito. Se prueban
varios modelos en orden (`HF_MODEL`) antes de dar error.

**Coste por generación:** unos 700–900 tokens. Con los modelos por defecto
sale en el entorno de $0.0005 por cotización, así que el plan Pro tiene margen
de sobra. Consulta tu gasto en
[huggingface.co/settings/billing](https://huggingface.co/settings/billing).

## Tecnología

- [Next.js 14](https://nextjs.org/) (App Router)
- TypeScript
- Tailwind CSS
- Supabase (Auth + PostgreSQL) — opcional
- [Hugging Face Inference Providers](https://huggingface.co/docs/inference-providers)
  — opcional

## Puesta en marcha

```bash
npm install
npm run dev
```

Abre http://localhost:3000

### Configurar Supabase (opcional)

Sin credenciales, la app corre en **modo demo**: los formularios de login y
registro te llevan directo al dashboard de ejemplo.

Para activar el login real:

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. En _Project Settings → API_ copia la **Project URL** y la **anon public key**.
3. Copia `.env.local.example` a `.env.local` y rellena:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
   ```

4. Reinicia `npm run dev`.

### Configurar el asistente de IA (opcional)

Sin `HF_TOKEN` el asistente aparece desactivado y la cotización se llena a mano.

1. Crea un token en
   [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
   (tipo **Read**, o *Fine-grained* con permiso de **Inference**).
2. Añádelo a `.env.local`:

   ```env
   HF_TOKEN=hf_xxxxxxxxxxxxxxxxxxxx
   ```

3. Aplica la migración `20260911120000_ai_credits.sql` en Supabase.
4. Reinicia `npm run dev`.

> Toda cuenta de Hugging Face incluye créditos gratis cada mes ($0.10 en
> cuentas Free, $2 en PRO). Pasado ese saldo se factura por uso, sin recargo.

## Estructura

```
app/
  page.tsx                          Landing page
  precios/page.tsx                  Planes y precios
  login/  register/                 Autenticación
  dashboard/
    layout.tsx                      Shell con navegación responsive
    page.tsx                        Dashboard (stats + cotizaciones demo)
    cotizaciones/nueva/page.tsx     Formulario de nueva cotización
components/
  site/        Navbar, Footer, QuoteMockup
  auth/        AuthShell, AuthForm
  dashboard/   DashboardNav, StatCard, EstadoBadge
  cotizacion/  NuevaCotizacionForm, AsistenteIA
  ui/          Logo, icons
lib/
  demo.ts      Datos de demostración
  format.ts    Formato de moneda
  ai/          Cliente de Hugging Face, prompt y saneado del borrador
  actions/     Server Actions (auth, perfil, clientes, cotizaciones, ia)
  supabase/    Clientes de Supabase (browser/server) + config
```

## Siguiente fase

1. **PDF real y enlace público** de la cotización (hoy se ve dentro del
   dashboard): es lo que cierra el flujo *crear → compartir → aceptar*.
2. **Cobro automático** del plan Pro (Stripe Payment Link + webhook que ponga
   `profiles.plan = 'pro'`). Hoy `NEXT_PUBLIC_CHECKOUT_URL` abre el checkout y
   el plan se activa a mano.
3. **Envío por WhatsApp** con el enlace de la cotización.
4. **Seguimiento**: recordatorio automático si el cliente no responde en 3 días.

Fuera de alcance por ahora: CRM, inventario, facturación y contabilidad.
