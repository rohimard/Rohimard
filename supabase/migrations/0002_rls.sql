-- MOMENTIA — Row Level Security
--
-- Filosofía de seguridad:
-- * Las tablas públicas (products) son legibles por cualquiera.
-- * Los formularios públicos (orders, delivery_addresses, payments, corporate_leads)
--   permiten INSERT anónimo (checkout / cotización sin necesidad de cuenta), pero
--   NO permiten SELECT anónimo: nadie puede leer pedidos ajenos.
-- * Las experiencias digitales (digital_experiences y tablas relacionadas) NO tienen
--   políticas anónimas: toda lectura (incluida la validación de PIN y expiración)
--   pasa por Server Actions con la Service Role Key, que aplican la lógica de
--   privacidad en código antes de exponer un solo dato.
-- * El panel /admin usa la Service Role Key en el servidor y además valida
--   `is_admin()` a nivel de aplicación y de base de datos.

create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable set search_path = public;

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.delivery_addresses enable row level security;
alter table public.digital_experiences enable row level security;
alter table public.experience_media enable row level security;
alter table public.experience_messages enable row level security;
alter table public.experience_music enable row level security;
alter table public.corporate_leads enable row level security;
alter table public.coupons enable row level security;
alter table public.settings enable row level security;

-- PROFILES
create policy "profiles: usuario ve su propio perfil" on public.profiles
  for select using (auth.uid() = id or public.is_admin());
create policy "profiles: usuario edita su propio perfil" on public.profiles
  for update using (auth.uid() = id or public.is_admin());
create policy "profiles: admin gestiona todo" on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());

-- PRODUCTS (catálogo público)
create policy "products: lectura pública de activos" on public.products
  for select using (active = true or public.is_admin());
create policy "products: admin escribe" on public.products
  for insert with check (public.is_admin());
create policy "products: admin actualiza" on public.products
  for update using (public.is_admin());
create policy "products: admin elimina" on public.products
  for delete using (public.is_admin());

create policy "product_variants: lectura pública" on public.product_variants
  for select using (active = true or public.is_admin());
create policy "product_variants: admin gestiona" on public.product_variants
  for all using (public.is_admin()) with check (public.is_admin());

-- ORDERS (checkout público, lectura solo admin)
create policy "orders: creación pública (checkout de invitado)" on public.orders
  for insert with check (true);
create policy "orders: admin lee y gestiona" on public.orders
  for select using (public.is_admin() or auth.uid() = customer_id);
create policy "orders: admin actualiza" on public.orders
  for update using (public.is_admin());
create policy "orders: admin elimina" on public.orders
  for delete using (public.is_admin());

create policy "order_items: creación pública" on public.order_items
  for insert with check (true);
create policy "order_items: admin lee" on public.order_items
  for select using (public.is_admin());
create policy "order_items: admin gestiona" on public.order_items
  for all using (public.is_admin()) with check (public.is_admin());

create policy "payments: creación pública (registrar comprobante)" on public.payments
  for insert with check (true);
create policy "payments: admin lee y valida" on public.payments
  for select using (public.is_admin());
create policy "payments: admin actualiza" on public.payments
  for update using (public.is_admin());

create policy "delivery_addresses: creación pública" on public.delivery_addresses
  for insert with check (true);
create policy "delivery_addresses: admin lee" on public.delivery_addresses
  for select using (public.is_admin());
create policy "delivery_addresses: admin gestiona" on public.delivery_addresses
  for all using (public.is_admin()) with check (public.is_admin());

-- DIGITAL EXPERIENCES: sin políticas anónimas — únicamente Service Role (servidor) o admin autenticado.
create policy "experiences: admin gestiona todo" on public.digital_experiences
  for all using (public.is_admin()) with check (public.is_admin());
create policy "experience_media: admin gestiona todo" on public.experience_media
  for all using (public.is_admin()) with check (public.is_admin());
create policy "experience_messages: admin gestiona todo" on public.experience_messages
  for all using (public.is_admin()) with check (public.is_admin());
create policy "experience_music: admin gestiona todo" on public.experience_music
  for all using (public.is_admin()) with check (public.is_admin());

-- CORPORATE LEADS (formulario B2B público)
create policy "corporate_leads: creación pública" on public.corporate_leads
  for insert with check (true);
create policy "corporate_leads: admin lee y gestiona" on public.corporate_leads
  for all using (public.is_admin()) with check (public.is_admin());

-- COUPONS / SETTINGS: solo admin (la validación de cupones en checkout usa Service Role)
create policy "coupons: admin gestiona" on public.coupons
  for all using (public.is_admin()) with check (public.is_admin());
create policy "settings: admin gestiona" on public.settings
  for all using (public.is_admin()) with check (public.is_admin());
