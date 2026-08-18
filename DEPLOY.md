# Desplegar CotizaPro

## Opción rápida: botón de Vercel (recomendada)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Frohimard%2FRohimard%2Ftree%2Fclaude%2Fcotizapro-initial-phase-lk7k6k&project-name=cotizapro&repository-name=cotizapro)

1. Pulsa el botón de arriba.
2. Inicia sesión en Vercel con tu cuenta de **GitHub**.
3. Vercel copiará este proyecto a un repositorio nuevo tuyo llamado `cotizapro`.
4. Pulsa **Deploy** y espera ~1 minuto.
5. Obtendrás una URL pública tipo `https://cotizapro.vercel.app` que puedes
   abrir desde tu teléfono.

> No hace falta configurar variables de entorno: la app arranca en **modo demo**.

## Importar manualmente (alternativa)

Si prefieres desplegar directamente desde tu repositorio actual:

1. Entra en <https://vercel.com/new>.
2. Elige **Import Git Repository** → selecciona `rohimard/Rohimard`.
3. En **Branch**, elige `claude/cotizapro-initial-phase-lk7k6k`.
4. Framework: Vercel detecta **Next.js** automáticamente. Deja todo por defecto.
5. Pulsa **Deploy**.

## Activar Supabase después del despliegue (opcional)

Cuando quieras el login/registro reales (Fase 2):

1. En Vercel, ve a tu proyecto → **Settings → Environment Variables**.
2. Agrega:
   - `NEXT_PUBLIC_SUPABASE_URL` = la Project URL de tu proyecto Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = la anon public key
3. Vuelve a desplegar (**Deployments → … → Redeploy**).

Las credenciales se obtienen en Supabase → *Project Settings → API*.

## Actualizaciones automáticas

Tras el primer despliegue, cada vez que hagas *push* a la rama conectada,
Vercel volverá a publicar la app automáticamente.
