# Supabase — Momentia

Momentia funciona sin Supabase (modo demo: las experiencias se guardan en el
navegador). Para que cualquiera que escanee un QR vea la experiencia desde
cualquier dispositivo, necesitas una base de datos real.

## Configurar

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. En el **SQL Editor**, ejecuta en orden los archivos de `supabase/migrations/`:
   - `0001_experiences.sql` — tabla `experiences` con RLS (lectura pública,
     creación pública, sin edición/borrado desde el cliente).
   - `0002_storage.sql` — bucket público `experiencias` para las fotos que la
     gente sube en `/crear`.
3. En _Project Settings → API_ copia la **Project URL** y la **anon public key**.
4. Copia `.env.local.example` a `.env.local` y complétalo:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
   ```

5. Reinicia `npm run dev` (o vuelve a desplegar en Vercel).

## Notas

- No hay autenticación: cualquiera puede crear una experiencia desde
  `/crear` y cualquiera puede leerla por su slug (así es como funciona el
  QR físico, sin pedirle login a quien lo escanea).
- Los slugs son la clave primaria de `experiences`, así que no puede haber
  dos experiencias con el mismo enlace (`momentia.pe/ese-slug`).
