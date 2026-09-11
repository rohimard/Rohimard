-- CotizaPro · Esquema completo (generado a partir de supabase/migrations/*)
-- Ejecuta este archivo completo en el SQL Editor de Supabase.


-- ===== supabase/migrations/20260818120000_schema.sql =====

-- CotizaPro · Fase 2 — Esquema base
-- Tablas: profiles, clients, quotes, quote_items
-- Requiere las extensiones estándar de Supabase (pgcrypto para gen_random_uuid).

create extension if not exists pgcrypto;

-- Actualiza automáticamente la columna updated_at en cada UPDATE.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles  (1 fila por usuario; id == auth.users.id)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id                uuid primary key references auth.users (id) on delete cascade,
  full_name         text        not null default '',
  business_name     text        not null default '',
  phone             text        not null default '',
  email             text        not null default '',
  address           text        not null default '',
  logo_url          text,
  currency          text        not null default 'USD',
  tax_rate          numeric(5,2)  not null default 0,
  quote_prefix      text        not null default 'COT-',
  quote_next_number integer     not null default 1,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- clients
-- ---------------------------------------------------------------------------
create table if not exists public.clients (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid        not null references auth.users (id) on delete cascade,
  name       text        not null,
  phone      text        not null default '',
  email      text        not null default '',
  address    text        not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists clients_user_id_idx on public.clients (user_id);

drop trigger if exists trg_clients_updated_at on public.clients;
create trigger trg_clients_updated_at
  before update on public.clients
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- quotes
-- ---------------------------------------------------------------------------
create table if not exists public.quotes (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid        not null references auth.users (id) on delete cascade,
  client_id           uuid        references public.clients (id) on delete set null,
  quote_number        text        not null,
  service_description text        not null default '',
  subtotal            numeric(14,2) not null default 0,
  discount            numeric(14,2) not null default 0,
  tax                 numeric(14,2) not null default 0,
  total               numeric(14,2) not null default 0,
  status              text        not null default 'draft'
                        check (status in ('draft','sent','viewed','accepted','rejected')),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  sent_at             timestamptz,
  viewed_at           timestamptz,
  accepted_at         timestamptz,
  rejected_at         timestamptz,
  -- El número de cotización es único por usuario.
  unique (user_id, quote_number)
);

create index if not exists quotes_user_id_idx on public.quotes (user_id);
create index if not exists quotes_client_id_idx on public.quotes (client_id);
create index if not exists quotes_created_at_idx on public.quotes (user_id, created_at desc);

drop trigger if exists trg_quotes_updated_at on public.quotes;
create trigger trg_quotes_updated_at
  before update on public.quotes
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- quote_items  (total generado automáticamente = quantity * unit_price)
-- ---------------------------------------------------------------------------
create table if not exists public.quote_items (
  id          uuid primary key default gen_random_uuid(),
  quote_id    uuid        not null references public.quotes (id) on delete cascade,
  description text        not null default '',
  quantity    numeric(14,2) not null default 0,
  unit_price  numeric(14,2) not null default 0,
  total       numeric(14,2) generated always as (round(quantity * unit_price, 2)) stored,
  created_at  timestamptz not null default now()
);

create index if not exists quote_items_quote_id_idx on public.quote_items (quote_id);

-- ===== supabase/migrations/20260818120100_rls.sql =====

-- CotizaPro · Fase 2 — Row Level Security
-- Regla fundamental: un usuario SOLO puede ver/modificar/eliminar sus datos.
-- La seguridad se garantiza en PostgreSQL, no en el frontend.

alter table public.profiles    enable row level security;
alter table public.clients     enable row level security;
alter table public.quotes      enable row level security;
alter table public.quote_items enable row level security;

-- ---------------------------------------------------------------------------
-- profiles  (id == auth.uid())
-- ---------------------------------------------------------------------------
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- clients  (user_id == auth.uid())
-- ---------------------------------------------------------------------------
drop policy if exists "clients_select_own" on public.clients;
create policy "clients_select_own" on public.clients
  for select using (auth.uid() = user_id);

drop policy if exists "clients_insert_own" on public.clients;
create policy "clients_insert_own" on public.clients
  for insert with check (auth.uid() = user_id);

drop policy if exists "clients_update_own" on public.clients;
create policy "clients_update_own" on public.clients
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "clients_delete_own" on public.clients;
create policy "clients_delete_own" on public.clients
  for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- quotes  (user_id == auth.uid())
-- ---------------------------------------------------------------------------
drop policy if exists "quotes_select_own" on public.quotes;
create policy "quotes_select_own" on public.quotes
  for select using (auth.uid() = user_id);

drop policy if exists "quotes_insert_own" on public.quotes;
create policy "quotes_insert_own" on public.quotes
  for insert with check (auth.uid() = user_id);

drop policy if exists "quotes_update_own" on public.quotes;
create policy "quotes_update_own" on public.quotes
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "quotes_delete_own" on public.quotes;
create policy "quotes_delete_own" on public.quotes
  for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- quote_items  (heredan la propiedad a través de la cotización padre)
-- ---------------------------------------------------------------------------
drop policy if exists "quote_items_select_own" on public.quote_items;
create policy "quote_items_select_own" on public.quote_items
  for select using (
    exists (
      select 1 from public.quotes q
      where q.id = quote_items.quote_id and q.user_id = auth.uid()
    )
  );

drop policy if exists "quote_items_insert_own" on public.quote_items;
create policy "quote_items_insert_own" on public.quote_items
  for insert with check (
    exists (
      select 1 from public.quotes q
      where q.id = quote_items.quote_id and q.user_id = auth.uid()
    )
  );

drop policy if exists "quote_items_update_own" on public.quote_items;
create policy "quote_items_update_own" on public.quote_items
  for update using (
    exists (
      select 1 from public.quotes q
      where q.id = quote_items.quote_id and q.user_id = auth.uid()
    )
  );

drop policy if exists "quote_items_delete_own" on public.quote_items;
create policy "quote_items_delete_own" on public.quote_items
  for delete using (
    exists (
      select 1 from public.quotes q
      where q.id = quote_items.quote_id and q.user_id = auth.uid()
    )
  );

-- ===== supabase/migrations/20260818120200_functions.sql =====

-- CotizaPro · Fase 2 — Funciones y triggers
--   1) Crear el perfil automáticamente al registrarse un usuario.
--   2) Asignar números de cotización únicos y consecutivos, sin duplicados.

-- ---------------------------------------------------------------------------
-- 1) Perfil automático tras el registro
--    Toma full_name y email de los metadatos del registro.
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'nombre',
      ''
    ),
    coalesce(new.email, '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- 2) Asignación atómica del número de cotización
--    Bloquea la fila del perfil (FOR UPDATE) para evitar números duplicados
--    aunque se creen cotizaciones de forma simultánea.
--    Devuelve el número formateado, p. ej. "COT-0001".
-- ---------------------------------------------------------------------------
create or replace function public.allocate_quote_number()
returns text
language plpgsql
security invoker
as $$
declare
  v_prefix text;
  v_next   integer;
begin
  select quote_prefix, quote_next_number
    into v_prefix, v_next
    from public.profiles
   where id = auth.uid()
   for update;

  if not found then
    raise exception 'profile_not_found';
  end if;

  update public.profiles
     set quote_next_number = v_next + 1
   where id = auth.uid();

  return v_prefix || lpad(v_next::text, 4, '0');
end;
$$;


-- ===== supabase/migrations/20260911120000_ai_credits.sql =====

-- CotizaPro · Fase 3 — Asistente de IA y planes
--   1) Columna `plan` en profiles (free | pro).
--   2) Tabla `ai_usage`: una fila por generación de IA (auditoría + cuota).
--   3) Función `consume_ai_credit`: consume 1 crédito del mes de forma atómica.

-- ---------------------------------------------------------------------------
-- 1) Plan del usuario
-- ---------------------------------------------------------------------------
alter table public.profiles
  add column if not exists plan text not null default 'free';

alter table public.profiles
  drop constraint if exists profiles_plan_check;
alter table public.profiles
  add constraint profiles_plan_check check (plan in ('free', 'pro'));

-- ---------------------------------------------------------------------------
-- 2) Registro de uso de IA
--    `period` es el mes en formato YYYY-MM: permite contar la cuota mensual
--    con un índice simple y sin cálculos de fechas en cada consulta.
-- ---------------------------------------------------------------------------
create table if not exists public.ai_usage (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid        not null references auth.users (id) on delete cascade,
  kind       text        not null default 'quote_draft',
  period     text        not null,
  prompt     text        not null default '',
  items      integer     not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists ai_usage_user_period_idx
  on public.ai_usage (user_id, period);

alter table public.ai_usage enable row level security;

-- El usuario solo puede leer su propio historial. La escritura pasa siempre
-- por `consume_ai_credit` (security definer), nunca directamente.
drop policy if exists "ai_usage_select_own" on public.ai_usage;
create policy "ai_usage_select_own"
  on public.ai_usage for select
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 3) Consumo atómico de un crédito
--    Devuelve jsonb: { allowed, used, limit, remaining, plan }
--    Si no quedan créditos devuelve allowed=false SIN registrar uso.
-- ---------------------------------------------------------------------------
create or replace function public.consume_ai_credit(
  p_kind   text default 'quote_draft',
  p_prompt text default ''
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user   uuid := auth.uid();
  v_period text := to_char(now() at time zone 'utc', 'YYYY-MM');
  v_plan   text;
  v_limit  integer;
  v_used   integer;
begin
  if v_user is null then
    raise exception 'not_authenticated';
  end if;

  -- Bloquea el perfil para que dos peticiones simultáneas no pasen la cuota.
  select coalesce(plan, 'free') into v_plan
    from public.profiles
   where id = v_user
   for update;

  if not found then
    raise exception 'profile_not_found';
  end if;

  v_limit := case when v_plan = 'pro' then 300 else 5 end;

  select count(*) into v_used
    from public.ai_usage
   where user_id = v_user
     and period = v_period;

  if v_used >= v_limit then
    return jsonb_build_object(
      'allowed',   false,
      'used',      v_used,
      'limit',     v_limit,
      'remaining', 0,
      'plan',      v_plan
    );
  end if;

  insert into public.ai_usage (user_id, kind, period, prompt)
  values (v_user, coalesce(p_kind, 'quote_draft'), v_period, left(coalesce(p_prompt, ''), 500));

  return jsonb_build_object(
    'allowed',   true,
    'used',      v_used + 1,
    'limit',     v_limit,
    'remaining', v_limit - v_used - 1,
    'plan',      v_plan
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- 4) Consulta de cuota sin consumirla (para pintar el contador en la UI)
-- ---------------------------------------------------------------------------
create or replace function public.ai_credit_status()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user   uuid := auth.uid();
  v_period text := to_char(now() at time zone 'utc', 'YYYY-MM');
  v_plan   text;
  v_limit  integer;
  v_used   integer;
begin
  if v_user is null then
    raise exception 'not_authenticated';
  end if;

  select coalesce(plan, 'free') into v_plan
    from public.profiles where id = v_user;
  v_plan  := coalesce(v_plan, 'free');
  v_limit := case when v_plan = 'pro' then 300 else 5 end;

  select count(*) into v_used
    from public.ai_usage
   where user_id = v_user and period = v_period;

  return jsonb_build_object(
    'allowed',   v_used < v_limit,
    'used',      v_used,
    'limit',     v_limit,
    'remaining', greatest(v_limit - v_used, 0),
    'plan',      v_plan
  );
end;
$$;

revoke all on function public.consume_ai_credit(text, text) from public;
revoke all on function public.ai_credit_status() from public;
grant execute on function public.consume_ai_credit(text, text) to authenticated;
grant execute on function public.ai_credit_status() to authenticated;

-- ---------------------------------------------------------------------------
-- 5) Devolución de un crédito
--    Si el modelo falla después de consumir el crédito, se devuelve para no
--    penalizar al usuario por un error del proveedor.
-- ---------------------------------------------------------------------------
create or replace function public.refund_ai_credit()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_id   uuid;
begin
  if v_user is null then
    raise exception 'not_authenticated';
  end if;

  select id into v_id
    from public.ai_usage
   where user_id = v_user
     and period = to_char(now() at time zone 'utc', 'YYYY-MM')
   order by created_at desc
   limit 1;

  if v_id is not null then
    delete from public.ai_usage where id = v_id;
  end if;
end;
$$;

revoke all on function public.refund_ai_credit() from public;
grant execute on function public.refund_ai_credit() to authenticated;
