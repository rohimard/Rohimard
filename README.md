# Momentia

**Regalos que continúan después de abrirlos.**

Tienda de cajas de regalo personalizadas donde cada caja física incluye un
**código QR único**. Al escanearlo, la persona que la recibe llega a su
propia página (`momentia.pe/su-nombre`) con un mensaje, una galería de
fotos, un video, una playlist y una carta hechos solo para ella.

> Flujo del producto: **Elegir caja → Personalizar experiencia digital →
> Imprimir el QR → Entregar la caja → Escanear y revivir el momento.**

## Desplegar en 1 clic

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Frohimard%2FRohimard%2Ftree%2Fclaude%2Fgift-sales-qr-personalized-bepice&project-name=momentia&repository-name=momentia)

Pulsa el botón, inicia sesión con GitHub y Vercel clona el proyecto y lo
publica con una URL pública en ~1 minuto. **No necesitas configurar nada**
(arranca en modo demo). Detalles en [`DEPLOY.md`](./DEPLOY.md).

## Qué incluye

- ✅ Landing page de marca (hero, líneas de producto, "lo que nos hace
  únicos", vista previa de la experiencia digital, cómo funciona, testimonios)
- ✅ `/tienda`: detalle y precio de las 3 líneas — **Esencial**, **Historia**
  y **Corporate**
- ✅ `/crear`: formulario en 4 pasos para personalizar la experiencia digital
  de una caja (destinatario, mensaje, carta, fotos, video, playlist)
- ✅ Generación y descarga del **código QR** listo para imprimir y colocar
  dentro de la caja física
- ✅ `/[slug]` (por ejemplo `/ana`): la página personalizada que ve la
  persona al escanear el QR — mensaje con efecto de sobre, galería de fotos,
  video embebido, playlist de Spotify embebida y carta digital
- ✅ **Modo demo** sin configuración: las experiencias se guardan en el
  navegador (localStorage) y hay una experiencia de ejemplo en `/ana`
- ✅ **Supabase** (opcional) para persistir experiencias y fotos de verdad,
  visibles para cualquiera que escanee el QR desde cualquier dispositivo
- ✅ Responsive, mobile-first

## Tecnología

- [Next.js 14](https://nextjs.org/) (App Router)
- TypeScript
- Tailwind CSS (paleta y tipografías de marca: Playfair Display + Great Vibes)
- Supabase (base de datos + storage) — opcional
- [`qrcode`](https://www.npmjs.com/package/qrcode) para generar el QR de cada experiencia

## Puesta en marcha

```bash
npm install
npm run dev
```

Abre <http://localhost:3000> y prueba:

- La landing y `/tienda`.
- `/crear` para personalizar una caja (funciona sin configurar nada).
- `/ana` para ver un ejemplo de la página que recibe quien escanea el QR.

### Configurar Supabase (opcional, recomendado en producción)

Sin credenciales, la app corre en **modo demo**: cada experiencia creada en
`/crear` se guarda solo en el navegador que la creó. Para que quede
disponible para cualquiera que escanee el QR físico, sigue
[`supabase/README.md`](./supabase/README.md) y luego copia
`.env.local.example` a `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

## Estructura

```
app/
  page.tsx                 Landing page
  tienda/page.tsx           Catálogo de las 3 líneas con precios
  crear/page.tsx            Formulario de personalización (4 pasos)
  crear/exito/page.tsx      Confirmación + código QR para imprimir
  [slug]/page.tsx           Página pública que ve quien escanea el QR
components/
  site/        Navbar, Footer
  home/        Secciones de la landing (Hero, líneas, experiencia digital…)
  crear/       Formulario de creación y tarjeta de QR
  experiencia/ Vista de la experiencia personalizada (sobre, galería, carta)
  ui/          Logo, iconos
lib/
  types.ts             Tipos y catálogo de líneas (Esencial/Historia/Corporate)
  slug.ts              Generación y validación de slugs (momentia.pe/nombre)
  format.ts            Moneda y embeds de YouTube/Vimeo/Spotify
  demo-data.ts         Experiencia de ejemplo (/ana)
  demo-store.ts        Persistencia en localStorage (modo demo)
  image.ts             Redimensionado de fotos en el navegador
  actions/experiences.ts  Server actions: crear y leer experiencias
  supabase/            Clientes de Supabase (opcional)
```

## Fuera de alcance en esta fase

Pagos en línea, panel de administración de pedidos, edición de una
experiencia ya creada, envío de notificaciones por WhatsApp/email. Llegarán
en fases posteriores.
