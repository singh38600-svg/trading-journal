-- Trading Journal — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New query

-- ── TRADES ──────────────────────────────────────────────────────
create table if not exists trades (
    id          bigserial primary key,
    symbol      text        not null,
    side        text        not null check (side in ('BUY', 'SELL')),
    quantity    numeric     not null default 0,
    entry_price numeric     not null default 0,
    pnl         numeric     not null default 0,
    fees        numeric     not null default 0,
    status      text        not null default 'FILLED',
    trade_time  timestamptz not null default now()
);

create index if not exists trades_trade_time_idx on trades (trade_time desc);
create index if not exists trades_symbol_idx     on trades (symbol);

-- ── POSITIONS ────────────────────────────────────────────────────
create table if not exists positions (
    id          bigserial primary key,
    symbol      text    not null unique,
    avg_price   numeric not null default 0,
    pnl         numeric not null default 0,
    updated_at  timestamptz not null default now()
);

-- ── ROW-LEVEL SECURITY (disable for service-role key usage) ──────
alter table trades    disable row level security;
alter table positions disable row level security;
