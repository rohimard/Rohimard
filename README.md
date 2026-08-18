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

## Estado: Fase 2 (datos reales y autenticación)

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

> **Migraciones SQL** en `supabase/migrations/` — ver [`supabase/README.md`](./supabase/README.md).

## Tecnología

- [Next.js 14](https://nextjs.org/) (App Router)
- TypeScript
- Tailwind CSS
- Supabase (Auth) — opcional en Fase 1

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

## Estructura

```
app/
  page.tsx                          Landing page
  login/  register/                 Autenticación
  dashboard/
    layout.tsx                      Shell con navegación responsive
    page.tsx                        Dashboard (stats + cotizaciones demo)
    cotizaciones/nueva/page.tsx     Formulario de nueva cotización
components/
  site/        Navbar, Footer, QuoteMockup
  auth/        AuthShell, AuthForm
  dashboard/   DashboardNav, StatCard, EstadoBadge
  cotizacion/  NuevaCotizacionForm
  ui/          Logo, icons
lib/
  demo.ts      Datos de demostración
  format.ts    Formato de moneda
  supabase/    Clientes de Supabase (browser/server) + config
```

## Fuera de alcance en Fase 1

Stripe/pagos, IA, WhatsApp automático, generación real de PDF, CRM, inventario,
facturación, contabilidad y automatizaciones. Llegarán en fases posteriores.
