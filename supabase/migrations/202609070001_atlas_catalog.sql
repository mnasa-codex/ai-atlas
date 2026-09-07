begin;
-- Existing installations may already have this table from schema.sql.
create table if not exists public.admin_users (user_id uuid primary key references auth.users(id), created_at timestamptz default now());
alter table public.admin_users enable row level security;
revoke all on public.admin_users from anon, authenticated;
grant select on public.admin_users to authenticated;
drop policy if exists "read own admin membership" on public.admin_users;
create policy "read own admin membership" on public.admin_users for select to authenticated using (user_id = auth.uid());

create table if not exists public.atlas_catalog (
  id integer primary key check (id = 1),
  content jsonb not null check (jsonb_typeof(content) = 'array' and jsonb_array_length(content) between 1 and 500),
  revision bigint not null default 1,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);
alter table public.atlas_catalog enable row level security;
revoke all on public.atlas_catalog from anon, authenticated;
grant select on public.atlas_catalog to anon, authenticated;
create policy "public read atlas catalog" on public.atlas_catalog for select using (true);

create table public.atlas_catalog_history (
  revision bigint primary key, content jsonb not null, archived_at timestamptz not null default now()
);
alter table public.atlas_catalog_history enable row level security;
revoke all on public.atlas_catalog_history from anon, authenticated;
grant select on public.atlas_catalog_history to authenticated;
create policy "admins read catalog history" on public.atlas_catalog_history for select to authenticated using (exists(select 1 from public.admin_users where user_id = auth.uid()));

create or replace function public.publish_atlas_catalog(document jsonb, expected_revision bigint)
returns bigint language plpgsql security definer set search_path = '' as $$
declare current_revision bigint; next_revision bigint; tool jsonb; plan jsonb; field text; item jsonb;
begin
  if auth.uid() is null or not exists(select 1 from public.admin_users where user_id = auth.uid()) then
    raise exception 'ADMIN_REQUIRED' using errcode = '42501';
  end if;
  if document is null or jsonb_typeof(document) <> 'array' then raise exception 'INVALID_CATALOG'; end if;
  if jsonb_array_length(document) not between 1 and 500 or octet_length(document::text) > 2000000 then raise exception 'INVALID_CATALOG'; end if;
  if (select count(distinct t->>'id') from jsonb_array_elements(document) t) <> jsonb_array_length(document) then raise exception 'DUPLICATE_IDS'; end if;
  for tool in select value from jsonb_array_elements(document) loop
    if jsonb_typeof(tool) <> 'object' or not tool ?& array['id','name','vendor','category','logo','hook','description','website','featured','plans'] then raise exception 'INVALID_TOOL'; end if;
    foreach field in array array['id','name','vendor','category','logo','hook','description','website'] loop
      if jsonb_typeof(tool->field) is distinct from 'string' or length(tool->>field)>10000 then raise exception 'INVALID_TOOL_TEXT'; end if;
    end loop;
    if tool ? 'logoUrl' and (jsonb_typeof(tool->'logoUrl') is distinct from 'string' or (tool->>'logoUrl' <> '' and (tool->>'logoUrl') !~ '^https://[^/@[:space:]]+([/?#]|$)')) then raise exception 'INVALID_LOGO'; end if;
    if (tool->>'id') !~ '^[a-z0-9][a-z0-9-]{0,99}$' or coalesce(length(trim(tool->>'name')),0) = 0
      or tool->>'category' not in ('chat','image','video','code','research','audio')
      or jsonb_typeof(tool->'featured') <> 'boolean' or jsonb_typeof(tool->'plans') <> 'array'
      or (tool->>'website') !~ '^https://[^/@[:space:]]+([/?#]|$)' then raise exception 'INVALID_TOOL'; end if;
    if jsonb_array_length(tool->'plans') > 30 then raise exception 'TOO_MANY_PLANS'; end if;
    if (select count(distinct p->>'name') from jsonb_array_elements(tool->'plans') p) <> jsonb_array_length(tool->'plans') then raise exception 'DUPLICATE_PLANS'; end if;
    for plan in select value from jsonb_array_elements(tool->'plans') loop
      if jsonb_typeof(plan) <> 'object' or not plan ?& array['name','bestFor','features','source','verified'] then raise exception 'INVALID_PLAN'; end if;
      foreach field in array array['name','bestFor','source','verified'] loop
        if jsonb_typeof(plan->field) is distinct from 'string' or length(plan->>field)>10000 then raise exception 'INVALID_PLAN_TEXT'; end if;
      end loop;
      foreach field in array array['custom','popular'] loop
        if plan ? field and jsonb_typeof(plan->field) is distinct from 'boolean' then raise exception 'INVALID_PLAN_FLAG'; end if;
      end loop;
      if plan ? 'limits' and (jsonb_typeof(plan->'limits') is distinct from 'string' or length(plan->>'limits')>10000) then raise exception 'INVALID_LIMITS'; end if;
      foreach field in array array['features','included'] loop
        if plan ? field then
          if jsonb_typeof(plan->field) is distinct from 'array' then raise exception 'INVALID_FEATURES'; end if;
          if jsonb_array_length(plan->field)>100 then raise exception 'INVALID_FEATURES'; end if;
          for item in select value from jsonb_array_elements(plan->field) loop
            if jsonb_typeof(item) is distinct from 'string' or length(item::text)>10002 then raise exception 'INVALID_FEATURES'; end if;
          end loop;
        end if;
      end loop;
      if coalesce(length(trim(plan->>'name')),0) = 0 or jsonb_typeof(plan->'features') <> 'array'
        or (plan->>'source') !~ '^https://[^/@[:space:]]+([/?#]|$)' then raise exception 'INVALID_PLAN'; end if;
      if plan ? 'monthly' then
        if jsonb_typeof(plan->'monthly') <> 'number' then raise exception 'INVALID_PRICE'; end if;
        if (plan->>'monthly')::numeric < 0 then raise exception 'INVALID_PRICE'; end if;
      end if;
      if plan ? 'annual' then
        if jsonb_typeof(plan->'annual') <> 'number' then raise exception 'INVALID_PRICE'; end if;
        if (plan->>'annual')::numeric < 0 then raise exception 'INVALID_PRICE'; end if;
      end if;
    end loop;
  end loop;
  -- Serialize the first insert as well as later updates; never silently overwrite another editor.
  perform pg_advisory_xact_lock(71423007);
  select revision into current_revision from public.atlas_catalog where id = 1 for update;
  current_revision := coalesce(current_revision, 0);
  if expected_revision is null or expected_revision <> current_revision then raise exception 'CATALOG_CONFLICT' using errcode = '40001'; end if;
  insert into public.atlas_catalog_history(revision,content) select revision,content from public.atlas_catalog where id=1;
  next_revision := current_revision + 1;
  insert into public.atlas_catalog(id,content,revision,updated_by) values(1,document,next_revision,auth.uid())
  on conflict(id) do update set content=excluded.content,revision=excluded.revision,updated_at=now(),updated_by=excluded.updated_by;
  return next_revision;
end $$;
revoke all on function public.publish_atlas_catalog(jsonb,bigint) from public, anon;
grant execute on function public.publish_atlas_catalog(jsonb,bigint) to authenticated;

create table public.atlas_research_usage (
  user_id uuid primary key references auth.users(id) on delete cascade,
  window_start timestamptz not null, requests integer not null
);
alter table public.atlas_research_usage enable row level security;
revoke all on public.atlas_research_usage from public, anon, authenticated;
create or replace function public.consume_atlas_research_quota()
returns boolean language plpgsql security definer set search_path = '' as $$
declare used integer;
begin
  if auth.uid() is null or not exists(select 1 from public.admin_users where user_id=auth.uid()) then raise exception 'ADMIN_REQUIRED' using errcode='42501'; end if;
  insert into public.atlas_research_usage as usage(user_id,window_start,requests) values(auth.uid(),now(),1)
  on conflict(user_id) do update set
    requests=case when usage.window_start <= now()-interval '1 hour' then 1 else usage.requests+1 end,
    window_start=case when usage.window_start <= now()-interval '1 hour' then now() else usage.window_start end
  where usage.window_start <= now()-interval '1 hour' or usage.requests < 10
  returning requests into used;
  return used is not null;
end $$;
revoke all on function public.consume_atlas_research_quota() from public, anon;
grant execute on function public.consume_atlas_research_quota() to authenticated;
commit;
