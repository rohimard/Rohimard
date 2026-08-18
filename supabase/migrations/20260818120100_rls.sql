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
