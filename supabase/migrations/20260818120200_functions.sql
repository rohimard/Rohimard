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
