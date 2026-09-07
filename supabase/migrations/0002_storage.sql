-- Bucket público para las fotos que la gente sube en /crear.
insert into storage.buckets (id, name, public)
values ('experiencias', 'experiencias', true)
on conflict (id) do nothing;

create policy "experiencias_public_read"
  on storage.objects for select
  using (bucket_id = 'experiencias');

create policy "experiencias_public_upload"
  on storage.objects for insert
  with check (bucket_id = 'experiencias');
