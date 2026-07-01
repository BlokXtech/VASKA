create table if not exists ledger_accounts (
  id text primary key,
  owner_id text not null,
  currency char(3) not null,
  created_at timestamptz not null default now()
);

create table if not exists service_providers (
  id text primary key,
  name text not null,
  category text not null check (category in ('electricity', 'airtime', 'data', 'betting', 'merchant')),
  settlement_account_id text not null references ledger_accounts(id),
  commission_bps integer not null check (commission_bps >= 0),
  compliance_tier text not null check (compliance_tier in ('standard', 'enhanced')),
  status text not null check (status in ('online', 'degraded', 'offline')),
  created_at timestamptz not null default now()
);

create table if not exists ledger_entries (
  id text primary key,
  transaction_id text not null,
  account_id text not null references ledger_accounts(id),
  direction text not null check (direction in ('debit', 'credit')),
  amount_minor bigint not null check (amount_minor > 0),
  currency char(3) not null,
  provider_id text references service_providers(id),
  customer_reference text,
  created_at timestamptz not null default now()
);

create table if not exists audit_events (
  id text primary key,
  actor_id text not null,
  action text not null,
  resource text not null,
  ip_address inet,
  created_at timestamptz not null default now()
);

create index if not exists ledger_entries_transaction_id_idx on ledger_entries(transaction_id);
create index if not exists ledger_entries_provider_id_idx on ledger_entries(provider_id);
create index if not exists audit_events_created_at_idx on audit_events(created_at desc);
