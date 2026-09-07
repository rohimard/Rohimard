# Desplegar Momentia

## Opción rápida: botón de Vercel (recomendada)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Frohimard%2FRohimard%2Ftree%2Fclaude%2Fgift-sales-qr-personalized-bepice&project-name=momentia&repository-name=momentia)

1. Pulsa el botón de arriba.
2. Inicia sesión en Vercel con tu cuenta de **GitHub**.
3. Vercel copiará este proyecto a un repositorio nuevo tuyo llamado `momentia`.
4. Pulsa **Deploy** y espera ~1 minuto.
5. Obtendrás una URL pública tipo `https://momentia.vercel.app`.

> No hace falta configurar variables de entorno: la app arranca en **modo
> demo** (las experiencias creadas en `/crear` se guardan en el navegador).

## Importar manualmente (alternativa)

Si prefieres desplegar directamente desde tu repositorio actual:

1. Entra en <https://vercel.com/new>.
2. Elige **Import Git Repository** → selecciona `rohimard/Rohimard`.
3. En **Branch**, elige `claude/gift-sales-qr-personalized-bepice`.
4. Framework: Vercel detecta **Next.js** automáticamente. Deja todo por defecto.
5. Pulsa **Deploy**.

## Activar Supabase después del despliegue (recomendado para producción)

Para que las experiencias creadas en `/crear` queden guardadas de verdad (y
no solo en el navegador de quien las creó), conecta Supabase:

1. Sigue `supabase/README.md` para crear el proyecto y correr las
   migraciones (tabla `experiences` + bucket de fotos).
2. En Vercel, ve a tu proyecto → **Settings → Environment Variables**.
3. Agrega:
   - `NEXT_PUBLIC_SUPABASE_URL` = la Project URL de tu proyecto Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = la anon public key
4. Vuelve a desplegar (**Deployments → … → Redeploy**).

## Dominio propio

Una vez tengas tu dominio (por ejemplo `momentia.pe`), agrégalo en Vercel →
**Settings → Domains**. Cada experiencia quedará disponible en
`momentia.pe/nombre-del-destinatario`.

## Actualizaciones automáticas

Tras el primer despliegue, cada vez que hagas *push* a la rama conectada,
Vercel volverá a publicar la app automáticamente.
