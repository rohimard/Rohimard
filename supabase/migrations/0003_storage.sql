-- MOMENTIA — Storage buckets
--
-- experience-media   privado. Fotos/videos subidos en el configurador y en el
--                    admin para cada experiencia digital. Se sirven mediante
--                    URLs firmadas generadas por Server Actions (Service Role).
-- payment-proofs     privado. Comprobantes de Yape/Plin/transferencia.
-- product-images     público. Fotografía de catálogo (marketing).

insert into storage.buckets (id, name, public)
values
  ('experience-media', 'experience-media', false),
  ('payment-proofs', 'payment-proofs', false),
  ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- Cualquiera puede SUBIR (el configurador es un flujo de invitado sin login),
-- pero nadie puede LEER directamente estos buckets privados: la app siempre
-- entrega el archivo mediante una URL firmada creada en el servidor.
create policy "experience-media: subida pública" on storage.objects
  for insert with check (bucket_id = 'experience-media');
create policy "experience-media: admin lee y gestiona" on storage.objects
  for select using (bucket_id = 'experience-media' and public.is_admin());
create policy "experience-media: admin elimina" on storage.objects
  for delete using (bucket_id = 'experience-media' and public.is_admin());

create policy "payment-proofs: subida pública" on storage.objects
  for insert with check (bucket_id = 'payment-proofs');
create policy "payment-proofs: admin lee" on storage.objects
  for select using (bucket_id = 'payment-proofs' and public.is_admin());

create policy "product-images: lectura pública" on storage.objects
  for select using (bucket_id = 'product-images');
create policy "product-images: admin gestiona" on storage.objects
  for insert with check (bucket_id = 'product-images' and public.is_admin());
create policy "product-images: admin actualiza" on storage.objects
  for update using (bucket_id = 'product-images' and public.is_admin());
create policy "product-images: admin elimina" on storage.objects
  for delete using (bucket_id = 'product-images' and public.is_admin());
