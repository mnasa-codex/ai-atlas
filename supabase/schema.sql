create extension if not exists pgcrypto;
create table if not exists public.tools (
  id uuid primary key default gen_random_uuid(), slug text unique not null, name text not null, vendor text not null, category text not null,
  logo_url text, hook_line text not null, short_description text not null, official_website text not null, is_featured boolean default false,
  display_order int default 0, created_at timestamptz default now(), updated_at timestamptz default now()
);
create table if not exists public.pricing_plans (
  id uuid primary key default gen_random_uuid(), tool_id uuid references public.tools(id) on delete cascade, plan_name text not null,
  price_monthly numeric, price_annual numeric, currency text default 'USD', is_custom_price boolean default false,
  best_for text not null default '', included text[] default '{}', usage_note text, is_popular boolean default false,
  features text[] not null, last_verified_at date not null, source_url text not null, display_order int default 0
);
create table if not exists public.site_settings (key text primary key, value text not null, updated_at timestamptz default now());
create table if not exists public.admin_users (user_id uuid primary key references auth.users(id), created_at timestamptz default now());
alter table public.tools enable row level security; alter table public.pricing_plans enable row level security; alter table public.site_settings enable row level security;
create policy "public read tools" on public.tools for select using (true);
create policy "public read pricing" on public.pricing_plans for select using (true);
create policy "public read settings" on public.site_settings for select using (true);
create policy "admin write tools" on public.tools for all using (auth.uid() in (select user_id from public.admin_users)) with check (auth.uid() in (select user_id from public.admin_users));
create policy "admin write pricing" on public.pricing_plans for all using (auth.uid() in (select user_id from public.admin_users)) with check (auth.uid() in (select user_id from public.admin_users));
create policy "admin write settings" on public.site_settings for all using (auth.uid() in (select user_id from public.admin_users)) with check (auth.uid() in (select user_id from public.admin_users));
insert into public.site_settings(key,value) values ('whatsapp_number','963932067632') on conflict do nothing;
insert into public.site_settings(key,value) values ('facebook_url','https://www.facebook.com/Alaabdalaziz?mibextid=ZbWKwL') on conflict do nothing;
