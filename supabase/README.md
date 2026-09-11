# Base de datos de CotizaPro (Supabase)

Las migraciones de `supabase/migrations/` definen todo el esquema, las políticas
de seguridad (RLS) y las funciones. Están numeradas y deben aplicarse **en orden**:

1. `20260818120000_schema.sql` — tablas `profiles`, `clients`, `quotes`, `quote_items`.
2. `20260818120100_rls.sql` — Row Level Security en las 4 tablas.
3. `20260818120200_functions.sql` — perfil automático al registrarse + numeración de cotizaciones.
4. `20260911120000_ai_credits.sql` — columna `plan`, tabla `ai_usage` y funciones
   de cuota del asistente de IA.

## Cómo aplicarlas

### Opción A — Editor SQL de Supabase (la más simple)

1. Entra a tu proyecto en [app.supabase.com](https://app.supabase.com).
2. Menú lateral → **SQL Editor** → **New query**.
3. Abre cada archivo de `supabase/migrations/` **en orden**, copia su contenido,
   pégalo y pulsa **Run**. (O usa el archivo combinado `supabase/schema.sql`,
   que contiene las cuatro en un solo bloque.)
4. Verifica en **Table Editor** que aparecen las 5 tablas y en
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

## Cuota del asistente de IA

`ai_usage` guarda una fila por generación. La cuota se calcula por mes
(`period` = `YYYY-MM`) y por plan:

| Plan   | Generaciones al mes |
| ------ | ------------------- |
| `free` | 5                   |
| `pro`  | 300                 |

Tres funciones la gobiernan:

- `ai_credit_status()` — consulta cuántas quedan, sin consumir.
- `consume_ai_credit(kind, prompt)` — consume una de forma atómica. Bloquea la
  fila del perfil (`for update`) para que dos peticiones simultáneas no se
  salten el límite. Devuelve `allowed=false` sin registrar nada si ya no quedan.
- `refund_ai_credit()` — devuelve el último crédito del mes. La app la llama
  cuando el modelo falla, para no cobrarle al usuario un error del proveedor.

Las tres son `security definer`: el usuario **no** puede escribir directamente
en `ai_usage` (solo tiene política de `select` sobre sus propias filas).

### Activar el plan Pro a un usuario

Mientras no haya cobro automático, se hace desde el SQL Editor:

```sql
update public.profiles set plan = 'pro' where email = 'cliente@ejemplo.com';
```
