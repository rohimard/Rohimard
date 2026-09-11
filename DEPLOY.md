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

No olvides aplicar las migraciones de `supabase/migrations/` (ver
[`supabase/README.md`](./supabase/README.md)).

## Activar el asistente de IA (opcional)

El asistente "Cotiza con IA" usa
[Hugging Face Inference Providers](https://huggingface.co/docs/inference-providers).

1. Crea un token en
   <https://huggingface.co/settings/tokens> (tipo **Read**, o *Fine-grained*
   con permiso de **Inference**).
2. En Vercel → **Settings → Environment Variables**, agrega:
   - `HF_TOKEN` = tu token `hf_...`
   - `HF_MODEL` *(opcional)* = modelos separados por coma, se prueban en orden
   - `NEXT_PUBLIC_CHECKOUT_URL` *(opcional)* = enlace de pago del plan Pro
3. Aplica la migración `20260911120000_ai_credits.sql` en Supabase.
4. Vuelve a desplegar.

> `HF_TOKEN` **no** lleva el prefijo `NEXT_PUBLIC_`: se queda en el servidor y
> nunca llega al navegador. No lo cambies a `NEXT_PUBLIC_HF_TOKEN`.

### Cuánto cuesta

Cada cotización generada gasta unos 700–900 tokens, en el entorno de $0.0005
con los modelos por defecto. Toda cuenta de Hugging Face incluye créditos
gratis cada mes ($0.10 en cuentas Free, $2 en PRO); pasado ese saldo se factura
por uso, sin recargo de Hugging Face. Revisa el gasto en
<https://huggingface.co/settings/billing>.

## Actualizaciones automáticas

Tras el primer despliegue, cada vez que hagas *push* a la rama conectada,
Vercel volverá a publicar la app automáticamente.
