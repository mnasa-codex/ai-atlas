create table if not exists public.market_candles(
 id bigserial primary key,
 symbol text not null check(symbol in ('BTCUSD','XAUUSD')),
 timeframe text not null,
 ts timestamptz not null,
 open numeric not null, high numeric not null, low numeric not null, close numeric not null,
 volume numeric not null default 0,
 source text not null default 'provider',
 unique(symbol,timeframe,ts)
);
create index if not exists market_candles_lookup on public.market_candles(symbol,timeframe,ts desc);

create table if not exists public.talaria_signals(
 signal_id uuid primary key default gen_random_uuid(),
 symbol text not null check(symbol in ('BTCUSD','XAUUSD')),
 timeframe text not null,
 direction text check(direction in ('LONG','SHORT')),
 strategy text,
 grade text,
 status text not null check(status in ('SIGNAL','NO_TRADE')),
 reason text not null,
 entry numeric not null,
 stop_loss numeric not null,
 take_profit numeric not null,
 risk_reward numeric not null,
 score numeric not null default 0,
 components jsonb not null default '[]'::jsonb,
 engine_version text not null default '2.0.0',
 created_at timestamptz not null default now()
);
create index if not exists talaria_signals_recent on public.talaria_signals(symbol,created_at desc);

create table if not exists public.talaria_risk_state(
 id boolean primary key default true,
 account_balance numeric not null default 10000,
 risk_pct numeric not null default .5,
 daily_loss_pct numeric not null default 0,
 daily_trade_count integer not null default 0,
 consecutive_losses integer not null default 0,
 trading_enabled boolean not null default true,
 updated_at timestamptz not null default now()
);
insert into public.talaria_risk_state(id) values(true) on conflict(id) do nothing;

alter table public.market_candles enable row level security;
alter table public.talaria_signals enable row level security;
alter table public.talaria_risk_state enable row level security;
create policy "public market candles read" on public.market_candles for select using(true);
create policy "public signals read" on public.talaria_signals for select using(true);
create policy "public risk state read" on public.talaria_risk_state for select using(true);
