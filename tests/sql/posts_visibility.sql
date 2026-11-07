-- Run after the posts visibility migration in one database session.
begin;
select set_config('test.post_prefix', 'rls-test-' || gen_random_uuid()::text, true);
insert into public.posts (slug, title, date, summary, content, draft) values
  (current_setting('test.post_prefix') || '-published', 'Published fixture', current_date, '', 'public', false),
  (current_setting('test.post_prefix') || '-draft', 'Draft fixture', current_date, '', 'private', true);

set local role anon;
do $$ begin
  if exists (select 1 from public.posts where slug = current_setting('test.post_prefix') || '-draft') then
    raise exception 'Anonymous reader could read the draft';
  end if;
  if not exists (select 1 from public.posts where slug = current_setting('test.post_prefix') || '-published') then
    raise exception 'Anonymous reader could not read the published post';
  end if;
end $$;

set local role authenticated;
do $$ begin
  if exists (select 1 from public.posts where slug = current_setting('test.post_prefix') || '-draft') then
    raise exception 'Ordinary authenticated reader could read the draft';
  end if;
end $$;

set local role service_role;
do $$ begin
  if not exists (select 1 from public.posts where slug = current_setting('test.post_prefix') || '-draft' and content = 'private') then
    raise exception 'Admin backend could not read the draft';
  end if;
end $$;
rollback;
