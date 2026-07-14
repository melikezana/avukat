insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'article-images',
  'article-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']::text[]
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "article_images_public_read" on storage.objects;
create policy "article_images_public_read"
on storage.objects
for select
to public
using (bucket_id = 'article-images');

drop policy if exists "article_images_authenticated_insert" on storage.objects;
create policy "article_images_authenticated_insert"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'article-images'
  and (storage.foldername(name))[1] = 'article-covers'
);

drop policy if exists "article_images_authenticated_update" on storage.objects;
create policy "article_images_authenticated_update"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'article-images'
  and (storage.foldername(name))[1] = 'article-covers'
)
with check (
  bucket_id = 'article-images'
  and (storage.foldername(name))[1] = 'article-covers'
);

drop policy if exists "article_images_authenticated_delete" on storage.objects;
create policy "article_images_authenticated_delete"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'article-images'
  and (storage.foldername(name))[1] = 'article-covers'
);
