# Base de datos de CotizaPro (Supabase)

Las migraciones de `supabase/migrations/` definen todo el esquema, las políticas
de seguridad (RLS) y las funciones. Están numeradas y deben aplicarse **en orden**:

1. `20260818120000_schema.sql` — tablas `profiles`, `clients`, `quotes`, `quote_items`.
2. `20260818120100_rls.sql` — Row Level Security en las 4 tablas.
3. `20260818120200_functions.sql` — perfil automático al registrarse + numeración de cotizaciones.

## Cómo aplicarlas

### Opción A — Editor SQL de Supabase (la más simple)

1. Entra a tu proyecto en [app.supabase.com](https://app.supabase.com).
2. Menú lateral → **SQL Editor** → **New query**.
3. Abre cada archivo de `supabase/migrations/` **en orden**, copia su contenido,
   pégalo y pulsa **Run**. (O usa el archivo combinado `supabase/schema.sql`,
   que contiene los tres en un solo bloque.)
4. Verifica en **Table Editor** que aparecen las 4 tablas y en
   **Authentication → Policies** que cada tabla tiene sus políticas.

### Opción B — Supabase CLI (reproducible)

```bash
# Requiere la CLI de Supabase y el proyecto enlazado (supabase link).
supabase db push
```

La CLI aplica los archivos de `supabase/migrations/` automáticamente.

## Confirmación de email

Por defecto Supabase pide confirmación por email al registrarse. La app maneja
ambos casos:

- **Confirmación activada:** tras registrarse se muestra "revisa tu correo".
- **Confirmación desactivada:** tras registrarse se entra directo al dashboard.

Para desactivarla (útil en pruebas): **Authentication → Providers → Email** →
desactiva *Confirm email*.
