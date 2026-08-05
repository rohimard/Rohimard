# Publicar Pulpo (conseguir un enlace para enseñarla)

Pulpo es una **app web**: no se descarga ni se instala. Se publica una vez en
internet y se abre desde el navegador (ordenador o móvil).

La forma más fácil y **gratuita** es **Vercel**, el hosting de los creadores de
Next.js. No hace falta configurar nada: el proyecto ya está preparado.

## Pasos (unos 5 minutos)

1. Entra en **https://vercel.com** y pulsa **Sign Up**.
2. Elige **"Continuar con GitHub"** y autoriza el acceso a tu cuenta.
3. En el panel de Vercel pulsa **Add New… → Project**.
4. Busca el repositorio **`rohimard/rohimard`** y pulsa **Import**.
   - Si Vercel no lo ve, pulsa **"Adjust GitHub App Permissions"** y dale acceso
     a ese repositorio.
5. No cambies nada (Vercel detecta Next.js solo). Pulsa **Deploy**.
6. En 1–2 minutos tendrás un enlace tipo **`https://rohimard.vercel.app`**.

Ese enlace ya lo puedes abrir tú y **enseñárselo a cualquiera** desde el móvil.

## Importante: esto es una DEMO

- Usa **datos de ejemplo**, sin login y sin conexión real a tiendas.
- Sirve para **enseñar y validar** el producto, no todavía para clientes reales
  que pagan.
- Los cambios que hagas en la demo (avanzar un pedido, etc.) pueden reiniciarse
  a los datos de ejemplo — es lo esperado en una demo.

Para convertirla en producto real hace falta el siguiente paso del roadmap:
login por cliente, base de datos y conectores a Shopify/Amazon/etc.

## Alternativas a Vercel

- **Netlify** (https://netlify.com) — mismo modelo, también gratis.
- **Railway** / **Render** — si más adelante quieres base de datos incluida.
