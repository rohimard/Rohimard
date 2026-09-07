-- MOMENTIA — esquema inicial
-- Regalos físicos personalizados + experiencia digital privada (QR).

create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────────────────────────────────
-- ENUMS
-- ─────────────────────────────────────────────────────────────────────────

do $$ begin
  create type occasion_type as enum
    ('pareja', 'mama', 'cumpleanos', 'amistad', 'agradecimiento', 'empresa', 'otra');
exception when duplicate_object then null; end $$;

do $$ begin
  create type music_option as enum ('cancion', 'playlist', 'spotify', 'sin_musica');
exception when duplicate_object then null; end $$;

do $$ begin
  create type privacy_level as enum ('public', 'private', 'temporal');
exception when duplicate_object then null; end $$;

do $$ begin
  create type experience_status as enum ('borrador', 'publicada', 'archivada');
exception when duplicate_object then null; end $$;

do $$ begin
  create type media_kind as enum ('photo', 'video');
exception when duplicate_object then null; end $$;

do $$ begin
  create type order_status as enum
    ('nuevo', 'pago_pendiente', 'confirmado', 'en_produccion', 'listo', 'enviado', 'entregado', 'cancelado');
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_method as enum ('yape', 'plin', 'transferencia', 'pasarela');
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_status as enum ('pendiente', 'en_revision', 'validado', 'rechazado');
exception when duplicate_object then null; end $$;

do $$ begin
  create type coupon_discount_type as enum ('percentage', 'fixed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type lead_status as enum ('nuevo', 'contactado', 'cotizado', 'ganado', 'perdido');
exception when duplicate_object then null; end $$;

-- ─────────────────────────────────────────────────────────────────────────
-- PROFILES  (extiende auth.users)
-- ─────────────────────────────────────────────────────────────────────────

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  phone text,
  role text not null default 'customer' check (role in ('admin', 'customer')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────
-- PRODUCTS
-- ─────────────────────────────────────────────────────────────────────────

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  eyebrow text,
  phrase text,
  description text,
  price_from numeric(10, 2) not null default 0,
  accent text not null default 'borgona',
  includes text[] not null default '{}',
  featured boolean not null default false,
  active boolean not null default true,
  sort_order int not null default 0,
  cover_image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  name text not null,
  price numeric(10, 2) not null,
  sku text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────
-- ORDERS
-- ─────────────────────────────────────────────────────────────────────────

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  customer_id uuid references auth.users (id) on delete set null,
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  occasion occasion_type not null default 'otra',
  product_id uuid references public.products (id),
  product_variant_id uuid references public.product_variants (id),
  recipient_name text,
  sender_name text,
  special_date date,
  message text,
  letter text,
  special_phrase text,
  music_option music_option not null default 'sin_musica',
  music_value text,
  media_paths text[] not null default '{}',
  subtotal numeric(10, 2) not null default 0,
  delivery_cost numeric(10, 2) not null default 0,
  discount numeric(10, 2) not null default 0,
  total numeric(10, 2) not null default 0,
  coupon_code text,
  status order_status not null default 'nuevo',
  payment_method payment_method,
  notes text,
  digital_experience_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id),
  product_variant_id uuid references public.product_variants (id),
  description text,
  quantity int not null default 1,
  unit_price numeric(10, 2) not null default 0,
  total numeric(10, 2) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  method payment_method not null,
  amount numeric(10, 2) not null,
  status payment_status not null default 'pendiente',
  proof_url text,
  validated_by uuid references auth.users (id),
  validated_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.delivery_addresses (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  contact_name text not null,
  phone text not null,
  district text not null,
  address text not null,
  reference text,
  delivery_date date,
  delivery_time text,
  delivery_cost numeric(10, 2) not null default 0,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────
-- DIGITAL EXPERIENCES  (el corazón del negocio: lo que hay detrás del QR)
-- ─────────────────────────────────────────────────────────────────────────

create table if not exists public.digital_experiences (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders (id) on delete set null,
  code text unique not null,
  slug text unique not null,
  recipient_name text not null,
  sender_name text,
  intro_message text not null default 'Hay algo que quiero que recuerdes...',
  welcome_message text,
  story text,
  letter text,
  final_message text not null default 'Este regalo termina aquí. El momento, no. ❤️',
  cover_image_url text,
  privacy privacy_level not null default 'public',
  pin_hash text,
  status experience_status not null default 'borrador',
  expires_at timestamptz,
  save_forever boolean not null default false,
  view_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.orders
  add constraint orders_digital_experience_fk
  foreign key (digital_experience_id) references public.digital_experiences (id) on delete set null;

create table if not exists public.experience_media (
  id uuid primary key default gen_random_uuid(),
  experience_id uuid not null references public.digital_experiences (id) on delete cascade,
  type media_kind not null default 'photo',
  url text not null,
  caption text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.experience_messages (
  id uuid primary key default gen_random_uuid(),
  experience_id uuid not null references public.digital_experiences (id) on delete cascade,
  section text not null check (section in ('bienvenida', 'historia', 'carta', 'mensaje_final')),
  title text,
  content text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.experience_music (
  id uuid primary key default gen_random_uuid(),
  experience_id uuid not null references public.digital_experiences (id) on delete cascade,
  option music_option not null default 'sin_musica',
  title text,
  artist text,
  url text,
  spotify_embed_url text,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────
-- CORPORATE LEADS / COUPONS / SETTINGS
-- ─────────────────────────────────────────────────────────────────────────

create table if not exists public.corporate_leads (
  id uuid primary key default gen_random_uuid(),
  company text not null,
  contact_name text not null,
  position text,
  email text not null,
  phone text not null,
  approx_quantity int,
  budget text,
  event_type text,
  message text,
  status lead_status not null default 'nuevo',
  created_at timestamptz not null default now()
);

create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  discount_type coupon_discount_type not null default 'percentage',
  discount_value numeric(10, 2) not null,
  expires_at timestamptz,
  max_uses int,
  used_count int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────
-- ÍNDICES
-- ─────────────────────────────────────────────────────────────────────────

create index if not exists idx_orders_status on public.orders (status);
create index if not exists idx_orders_created_at on public.orders (created_at desc);
create index if not exists idx_experiences_slug on public.digital_experiences (slug);
create index if not exists idx_experiences_code on public.digital_experiences (code);
create index if not exists idx_experience_media_experience_id on public.experience_media (experience_id);
create index if not exists idx_experience_messages_experience_id on public.experience_messages (experience_id);
create index if not exists idx_product_variants_product_id on public.product_variants (product_id);

-- ─────────────────────────────────────────────────────────────────────────
-- FUNCIONES Y TRIGGERS
-- ─────────────────────────────────────────────────────────────────────────

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists trg_products_updated_at on public.products;
create trigger trg_products_updated_at before update on public.products
  for each row execute function public.set_updated_at();

drop trigger if exists trg_orders_updated_at on public.orders;
create trigger trg_orders_updated_at before update on public.orders
  for each row execute function public.set_updated_at();

drop trigger if exists trg_experiences_updated_at on public.digital_experiences;
create trigger trg_experiences_updated_at before update on public.digital_experiences
  for each row execute function public.set_updated_at();

-- Crea automáticamente un perfil "customer" cuando alguien se registra en Supabase Auth.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists trg_on_auth_user_created on auth.users;
create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Genera un número de pedido correlativo y legible: MMT-2026-000123
create sequence if not exists public.order_number_seq;

create or replace function public.generate_order_number()
returns text as $$
declare
  next_id bigint;
begin
  next_id := nextval('public.order_number_seq');
  return 'MMT-' || to_char(now(), 'YYYY') || '-' || lpad(next_id::text, 6, '0');
end;
$$ language plpgsql;
