do $$
declare
  category_exists boolean;
  name_column text;
  active_column text;
  sort_column text;
  next_sort numeric;
  insert_columns text;
  insert_values text;
begin
  if to_regclass('public.categories') is null then
    raise notice 'public.categories table not found; categories are managed by application code.';
    return;
  end if;

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'categories'
      and column_name = 'slug'
  ) then
    raise notice 'public.categories.slug column not found; skipping Miras Hukuku category seed.';
    return;
  end if;

  select column_name
  into name_column
  from information_schema.columns
  where table_schema = 'public'
    and table_name = 'categories'
    and column_name in ('name', 'title', 'label')
  order by array_position(array['name', 'title', 'label']::text[], column_name::text)
  limit 1;

  if name_column is null then
    raise notice 'public.categories name/title/label column not found; skipping Miras Hukuku category seed.';
    return;
  end if;

  select column_name
  into active_column
  from information_schema.columns
  where table_schema = 'public'
    and table_name = 'categories'
    and column_name in ('is_active', 'isActive', 'active')
  order by array_position(array['is_active', 'isActive', 'active']::text[], column_name::text)
  limit 1;

  select column_name
  into sort_column
  from information_schema.columns
  where table_schema = 'public'
    and table_name = 'categories'
    and column_name in ('sort_order', 'sortOrder', 'display_order', 'displayOrder', 'position', 'order')
    and data_type in ('smallint', 'integer', 'bigint', 'numeric', 'real', 'double precision')
  order by array_position(
    array['sort_order', 'sortOrder', 'display_order', 'displayOrder', 'position', 'order']::text[],
    column_name::text
  )
  limit 1;

  execute format('select exists (select 1 from public.categories where %I = %L)', 'slug', 'miras-hukuku')
  into category_exists;

  if category_exists then
    if active_column is not null then
      execute format('update public.categories set %I = true where %I = %L', active_column, 'slug', 'miras-hukuku');
    end if;

    return;
  end if;

  insert_columns := format('%I, %I', name_column, 'slug');
  insert_values := format('%L, %L', 'Miras Hukuku', 'miras-hukuku');

  if active_column is not null then
    insert_columns := insert_columns || format(', %I', active_column);
    insert_values := insert_values || ', true';
  end if;

  if sort_column is not null then
    execute format('select coalesce(max(%I), 0) + 1 from public.categories', sort_column)
    into next_sort;

    insert_columns := insert_columns || format(', %I', sort_column);
    insert_values := insert_values || format(', %s', next_sort);
  end if;

  execute format('insert into public.categories (%s) values (%s)', insert_columns, insert_values);
end $$;
