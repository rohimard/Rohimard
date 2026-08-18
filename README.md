# CotizaPro

Micro-SaaS para trabajadores independientes y pequeños negocios (electricistas,
plomeros, técnicos, pintores, fotógrafos, jardineros…) que permite **crear una
cotización profesional en menos de 60 segundos**, generar un PDF y compartirla
con el cliente.

> Flujo del producto: **Crear cotización → Generar PDF → Compartir → Seguimiento**

## Estado: Fase 1 (base sólida)

Esta fase incluye la estructura, el sistema visual y las pantallas base. Los
datos son de **demostración** y aún no hay persistencia real ni generación de PDF.

- ✅ Landing page (hero, problema, solución, cómo funciona, CTA)
- ✅ Sistema de diseño (Tailwind + tokens de marca)
- ✅ Login y registro (`/login`, `/register`) con Supabase Auth + modo demo
- ✅ Dashboard (`/dashboard`) con estadísticas y últimas cotizaciones
- ✅ Nueva cotización (`/dashboard/cotizaciones/nueva`) con cálculo en vivo
- ✅ Responsive (prioridad móvil: 360 / 390 / 412 px, tablet y desktop)

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
