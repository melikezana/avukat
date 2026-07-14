alter table public.articles
  add column if not exists seo_title text,
  add column if not exists seo_description text,
  add column if not exists canonical_url text,
  add column if not exists og_image_url text,
  add column if not exists focus_keyword text,
  add column if not exists author_name text default 'Av. İdris Dağkesen';

update public.articles
set author_name = 'Av. İdris Dağkesen'
where author_name is null or btrim(author_name) = '';

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'articles_seo_title_length_check'
      and conrelid = 'public.articles'::regclass
  ) then
    alter table public.articles
      add constraint articles_seo_title_length_check
      check (seo_title is null or char_length(seo_title) <= 60);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'articles_seo_description_length_check'
      and conrelid = 'public.articles'::regclass
  ) then
    alter table public.articles
      add constraint articles_seo_description_length_check
      check (seo_description is null or char_length(seo_description) <= 160);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'articles_canonical_url_check'
      and conrelid = 'public.articles'::regclass
  ) then
    alter table public.articles
      add constraint articles_canonical_url_check
      check (
        canonical_url is null
        or btrim(canonical_url) = ''
        or canonical_url ~* '^https?://[[:alnum:]][[:alnum:].-]*(:[0-9]+)?(/.*)?$'
      );
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'articles_focus_keyword_length_check'
      and conrelid = 'public.articles'::regclass
  ) then
    alter table public.articles
      add constraint articles_focus_keyword_length_check
      check (focus_keyword is null or char_length(focus_keyword) <= 100);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'articles_author_name_length_check'
      and conrelid = 'public.articles'::regclass
  ) then
    alter table public.articles
      add constraint articles_author_name_length_check
      check (author_name is null or char_length(author_name) <= 120);
  end if;
end $$;

drop policy if exists "article_images_authenticated_insert" on storage.objects;
create policy "article_images_authenticated_insert"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'article-images'
  and (storage.foldername(name))[1] in ('article-covers', 'article-content')
);

drop policy if exists "article_images_authenticated_update" on storage.objects;
create policy "article_images_authenticated_update"
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

drop policy if exists "article_images_authenticated_delete" on storage.objects;
create policy "article_images_authenticated_delete"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'article-images'
  and (storage.foldername(name))[1] in ('article-covers', 'article-content')
);
