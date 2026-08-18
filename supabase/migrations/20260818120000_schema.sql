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
