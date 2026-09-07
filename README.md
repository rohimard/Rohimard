# MOMENTIA

**"Regalos que continúan después de abrirlos."**

MOMENTIA es una marca de experiencias de regalo: cada caja física personalizada
incluye un código QR que abre una experiencia digital privada (fotos, video,
carta, música e historia) para quien la recibe.

## Tecnología

- [Next.js 14](https://nextjs.org/) (App Router) + TypeScript estricto
- Tailwind CSS + componentes propios estilo shadcn/ui (Radix UI + CVA)
- Framer Motion para las animaciones
- Lucide Icons
- [Supabase](https://supabase.com) — Auth, Postgres (RLS), Storage
- Zod para validación de formularios y Server Actions

## 1. Instalación

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). **El sitio funciona sin
Supabase configurado** (modo demo): la landing, el configurador (sin
persistencia real) y la experiencia de ejemplo `/m/demo` están siempre
disponibles.

## 2. Variables de entorno

Copia `.env.local.example` a `.env.local`:

```bash
cp .env.local.example .env.local
```

| Variable | Descripción |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave anónima (pública) |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave de servicio — **solo servidor**, nunca se expone al cliente |
| `NEXT_PUBLIC_SITE_URL` | URL pública del sitio (metadata, sitemap) |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Número de WhatsApp de ventas (código de país + número) |
| `NEXT_PUBLIC_INSTAGRAM_URL` / `_TIKTOK_URL` / `_FACEBOOK_URL` | Redes sociales |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Correo de contacto |

## 3. Conectar Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. En `Project Settings → API`, copia `Project URL`, `anon public key` y
   `service_role key` a tu `.env.local`.
3. Ejecuta las migraciones SQL en orden (ver [`supabase/README.md`](./supabase/README.md)):
   - `0001_schema.sql` — tablas, enums, triggers
   - `0002_rls.sql` — Row Level Security
   - `0003_storage.sql` — buckets de Storage
   - `0004_seed.sql` — productos, configuración y experiencia de ejemplo
4. Reinicia `npm run dev` (o vuelve a desplegar en Vercel).

### Crear el primer administrador

1. Regístrate como usuario normal (ej. desde Supabase Auth, o crea el usuario
   manualmente en `Authentication → Users` del panel de Supabase).
2. En el `SQL Editor` de Supabase:

   ```sql
   update public.profiles set role = 'admin'
   where id = (select id from auth.users where email = 'tu-correo@dominio.com');
   ```

3. Inicia sesión en `/admin/login`.

## 4. Ejecutar localmente

```bash
npm run dev     # desarrollo
npm run build   # build de producción
npm run start   # servir el build
npm run lint    # lint
```

## 5. Desplegar en Vercel

1. Sube el repositorio a GitHub.
2. Importa el proyecto en [vercel.com/new](https://vercel.com/new).
3. Agrega las variables de entorno de `.env.local.example` en
   `Project Settings → Environment Variables`.
4. Despliega. Next.js y Tailwind funcionan out-of-the-box en Vercel.

## 6. Gestionar pedidos

- El configurador público (`/crear`) crea un pedido en la tabla `orders`
  (invitado, sin necesidad de cuenta) junto con su `delivery_addresses`.
- En `/admin/pedidos` puedes filtrar por estado y ver el detalle completo
  (historia, recuerdos subidos, entrega, pago) en `/admin/pedidos/[id]`.
- Los estados posibles son: `nuevo → pago_pendiente → confirmado →
  en_produccion → listo → enviado → entregado` (o `cancelado`).

## 7. Crear experiencias QR

1. Desde el detalle de un pedido, pulsa **"Crear experiencia QR"** — esto
   pre-llena el formulario con los datos del pedido (nombre, mensaje, carta,
   música).
2. También puedes crear una experiencia desde cero en `/admin/experiencias/nueva`.
3. Sube fotos/videos desde el editor (`/admin/experiencias/[id]`), define
   privacidad (**pública**, **privada con PIN** o **temporal con expiración**)
   y música (canción, playlist, link de Spotify o sin música).
4. Cambia el estado a **"Publicada"** para que sea visible en
   `momentia.pe/m/tu-slug`.
5. Genera el código QR apuntando a esa URL con cualquier generador de QR
   (por ejemplo, al imprimir la tarjeta física de la caja).

La lógica de privacidad (PIN, expiración) se resuelve siempre en el servidor
con la Service Role Key — nunca se exponen datos de una experiencia privada
antes de validar el PIN.

## 8. Configurar WhatsApp

Define `NEXT_PUBLIC_WHATSAPP_NUMBER` con el código de país + número, sin `+`
ni espacios (ej. Perú: `51987654321`). Este número se usa en:

- El botón flotante de WhatsApp (todas las páginas, excepto `/admin` y `/m/*`).
- El enlace de confirmación al final del configurador.
- El footer del sitio.

## 9. Añadir métodos de pago

Por ahora MOMENTIA usa un flujo de **pago manual**: el pedido se crea con
estado `nuevo`/`pago_pendiente`, el cliente paga por Yape/Plin/transferencia
y envía su comprobante por WhatsApp; un administrador valida el pago
manualmente y actualiza el estado en `/admin/pedidos/[id]`.

La tabla `payments` (con `method`, `amount`, `status`, `proof_url`) ya está
lista para:

- Registrar comprobantes subidos (bucket privado `payment-proofs`).
- Integrar en el futuro una pasarela de pago (Culqi, Niubiz, Mercado Pago,
  etc.) sin cambiar el modelo de datos — solo agregar el proveedor real y
  actualizar `payment_status` vía webhook.

No se ha inventado ninguna integración de pagos real; las variables de
entorno para una futura pasarela deben agregarse a `.env.local.example`
cuando se decida el proveedor.

## Estructura del proyecto

```
app/
  page.tsx                     Home
  como-funciona/                Página "Cómo funciona"
  inspiracion/                  Galería de inspiración por categoría
  corporate/                    Página B2B + formulario de cotización
  productos/  [slug]/           Catálogo y detalle de producto
  crear/                        Configurador (wizard de 7 pasos)
  m/[slug]/                     Experiencia digital privada (QR)
  admin/
    login/                      Login del panel
    (protected)/                Dashboard, pedidos, experiencias, productos,
                                 cupones, configuración (protegido por middleware)
  sitemap.ts  robots.ts  opengraph-image.tsx

components/
  layout/        Header, Footer, WhatsAppButton
  home/          Secciones de la landing (Hero, Concept, WhyDifferent...)
  configurator/  Los 7 pasos del wizard + resumen + confirmación
  experience/    Intro, PIN gate y las 7 secciones de la experiencia QR
  corporate/     Formulario B2B
  admin/         Sidebar, formularios y tablas del panel
  ui/            Primitivas (button, input, select, dialog, card...)
  decorative/    Ornamentos sutiles (florales, líneas doradas, corazones)
  motion/        Helpers de animación con Framer Motion

lib/
  supabase/      Clientes (browser / server / admin con Service Role)
  actions/       Server Actions (pedidos, experiencias, admin, corporate)
  data/          Contenido de productos, delivery, experiencia demo
  types/         Tipos de dominio y de base de datos
  validations/   Esquemas Zod
  utils/         cn, moneda, PIN hashing

supabase/
  migrations/    0001_schema · 0002_rls · 0003_storage · 0004_seed
```

## Seguridad

- Row Level Security activo en todas las tablas.
- El checkout permite `INSERT` anónimo (regalo sin cuenta), pero **nunca**
  `SELECT` anónimo de pedidos ajenos.
- Las experiencias digitales solo se leen desde Server Actions con la
  Service Role Key, aplicando en código la lógica de privacidad/PIN/expiración
  antes de exponer cualquier dato — no hay ruta anónima que pueda leerlas
  directamente de la base de datos.
- El panel `/admin` está protegido por middleware (sesión de Supabase) y
  además valida `role = 'admin'` en cada página del lado del servidor.
- Los PIN de experiencias privadas se guardan con hash SHA-256, nunca en texto plano.

## Fuera de alcance en esta fase

Pasarela de pago real, notificaciones automáticas por WhatsApp/email,
generación automática del código QR como imagen dentro del panel (se genera
con un servicio externo apuntando a la URL de la experiencia), y
edición completa del catálogo desde `/admin/productos` (por ahora permite
precio, activo y destacado — el contenido editorial vive en
`lib/data/products.ts`).
