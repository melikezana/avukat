alter table public.contact_messages
  add column if not exists replied_at timestamptz,
  add column if not exists reply_body text;

create index if not exists contact_messages_status_idx
  on public.contact_messages (status);

create index if not exists contact_messages_created_at_idx
  on public.contact_messages (created_at desc);

create index if not exists articles_slug_idx
  on public.articles (slug);

create index if not exists articles_status_idx
  on public.articles (status);

create index if not exists articles_category_idx
  on public.articles (category);

create index if not exists articles_published_at_idx
  on public.articles (published_at desc);

create index if not exists articles_updated_at_idx
  on public.articles (updated_at desc);

alter table public.articles enable row level security;
alter table public.contact_messages enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'articles'
      and policyname = 'Anon can read published articles'
  ) then
    create policy "Anon can read published articles"
    on public.articles
    for select
    to anon
    using (status = 'published');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'articles'
      and policyname = 'Authenticated users can manage articles'
  ) then
    create policy "Authenticated users can manage articles"
    on public.articles
    for all
    to authenticated
    using (true)
    with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'contact_messages'
      and policyname = 'Anon can insert contact messages'
  ) then
    create policy "Anon can insert contact messages"
    on public.contact_messages
    for insert
    to anon
    with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'contact_messages'
      and policyname = 'Authenticated users can manage contact messages'
  ) then
    create policy "Authenticated users can manage contact messages"
    on public.contact_messages
    for all
    to authenticated
    using (true)
    with check (true);
  end if;
end $$;

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

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Article images are publicly readable'
  ) then
    create policy "Article images are publicly readable"
    on storage.objects
    for select
    to public
    using (bucket_id = 'article-images');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Authenticated users can upload article images'
  ) then
    create policy "Authenticated users can upload article images"
    on storage.objects
    for insert
    to authenticated
    with check (
      bucket_id = 'article-images'
      and (storage.foldername(name))[1] in ('article-covers', 'article-content')
    );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Authenticated users can update article images'
  ) then
    create policy "Authenticated users can update article images"
    on storage.objects
    for update
    to authenticated
    using (
      bucket_id = 'article-images'
      and (storage.foldername(name))[1] in ('article-covers', 'article-content')
    )
    with check (
      bucket_id = 'article-images'
      and (storage.foldername(name))[1] in ('article-covers', 'article-content')
    );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Authenticated users can delete article images'
  ) then
    create policy "Authenticated users can delete article images"
    on storage.objects
    for delete
    to authenticated
    using (
      bucket_id = 'article-images'
      and (storage.foldername(name))[1] in ('article-covers', 'article-content')
    );
  end if;
end $$;
