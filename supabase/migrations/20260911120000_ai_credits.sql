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
