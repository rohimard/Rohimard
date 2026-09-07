-- Tabla de experiencias digitales personalizadas (una por caja/QR).
create table if not exists public.experiences (
  slug text primary key,
  box_line text not null check (box_line in ('esencial', 'historia', 'corporate')),
  sender_name text not null,
  recipient_name text not null,
  message text not null default '',
  letter text not null default '',
  photos jsonb not null default '[]'::jsonb,
  video_url text,
  playlist_url text,
  created_at timestamptz not null default now()
);

alter table public.experiences enable row level security;

-- Cualquiera puede leer una experiencia por su slug (así funciona el QR:
-- sin login, cualquiera que lo escanee puede ver la página).
create policy "experiences_public_read"
  on public.experiences for select
  using (true);

-- Cualquiera puede crear una experiencia desde /crear (no hay login en
-- Momentia). El slug es la clave primaria, así que no se puede duplicar.
create policy "experiences_public_insert"
  on public.experiences for insert
  with check (true);

-- No se permite editar ni borrar desde el cliente; solo lectura/creación.
