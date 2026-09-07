# Base de datos de MOMENTIA

Migraciones SQL en `supabase/migrations/`, pensadas para ejecutarse **en orden**:

1. `0001_schema.sql` — tipos enum, tablas, índices, triggers y funciones (incluye
   la generación automática de perfiles al registrarse y de números de pedido).
2. `0002_rls.sql` — Row Level Security en todas las tablas + función `is_admin()`.
3. `0003_storage.sql` — buckets de Storage (`experience-media`, `payment-proofs`,
   `product-images`) y sus políticas.
4. `0004_seed.sql` — productos MOMENTIA, configuración de delivery, campaña de
   lanzamiento y una experiencia de demostración (`/m/demo`).

## Cómo aplicarlas

**Opción A — Panel de Supabase (recomendado si no usas la CLI):**

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. Ve a `SQL Editor` → `New query`.
3. Pega y ejecuta cada archivo, en el orden 0001 → 0002 → 0003 → 0004.

**Opción B — Supabase CLI:**

```bash
supabase link --project-ref <tu-project-ref>
supabase db push
```

## Crear el primer administrador

1. Registra un usuario cualquiera (se crea con `role = 'customer'` automáticamente).
2. En `SQL Editor`, ejecuta:

   ```sql
   update public.profiles set role = 'admin' where id =
     (select id from auth.users where email = 'tu-correo@dominio.com');
   ```

3. Inicia sesión en `/admin/login` con ese correo.

## Notas de arquitectura

- Todo lo relacionado a **experiencias digitales** (`digital_experiences` y tablas
  relacionadas) se lee/escribe siempre desde el servidor con la Service Role Key
  (`lib/supabase/admin.ts`). Así la lógica de privacidad (pública / PIN / temporal)
  vive en código de aplicación, no se filtra nunca vía RLS a un cliente anónimo.
- El checkout del configurador (`orders`, `order_items`, `payments`,
  `delivery_addresses`) permite `INSERT` anónimo (regalo sin necesidad de crear
  cuenta), pero el `SELECT` está restringido a administradores.
