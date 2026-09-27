-- ============================================================
-- Monefy Personal - Initial schema
-- ============================================================
create extension if not exists "uuid-ossp";

-- ---------- updated_at trigger fn ----------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ============================================================
-- PROFILES
-- ============================================================
create table profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  full_name text not null,
  avatar_url text,
  currency text not null default 'IDR',
  locale text not null default 'id-ID',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "profiles_select_own" on profiles for select using (auth.uid() = user_id);
create policy "profiles_insert_own" on profiles for insert with check (auth.uid() = user_id);
create policy "profiles_update_own" on profiles for update using (auth.uid() = user_id);

create trigger trg_profiles_updated_at before update on profiles
  for each row execute function set_updated_at();

-- auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (user_id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', 'User'));
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================
-- ACCOUNTS
-- ============================================================
create type account_type as enum ('cash','bank','ewallet','credit_card','investment','other');

create table accounts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type account_type not null default 'cash',
  balance numeric(16,2) not null default 0,
  currency text not null default 'IDR',
  icon text,
  color text,
  is_active boolean not null default true,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table accounts enable row level security;
create policy "accounts_select_own" on accounts for select using (auth.uid() = user_id);
create policy "accounts_insert_own" on accounts for insert with check (auth.uid() = user_id);
create policy "accounts_update_own" on accounts for update using (auth.uid() = user_id);
create policy "accounts_delete_own" on accounts for delete using (auth.uid() = user_id);

create trigger trg_accounts_updated_at before update on accounts
  for each row execute function set_updated_at();

create index idx_accounts_user_id on accounts(user_id);

-- ============================================================
-- CATEGORIES
-- ============================================================
create type category_type as enum ('income','expense');

create table categories (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade, -- null = default/global
  name text not null,
  type category_type not null,
  icon text,
  color text,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

alter table categories enable row level security;
-- user can see own categories + default (user_id is null) categories
create policy "categories_select" on categories for select
  using (auth.uid() = user_id or user_id is null);
create policy "categories_insert_own" on categories for insert with check (auth.uid() = user_id);
create policy "categories_update_own" on categories for update using (auth.uid() = user_id);
create policy "categories_delete_own" on categories for delete using (auth.uid() = user_id);

create index idx_categories_user_id on categories(user_id);

-- ============================================================
-- TRANSACTIONS
-- ============================================================
create type transaction_type as enum ('income','expense','transfer');

create table transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  account_id uuid not null references accounts(id) on delete restrict,
  category_id uuid references categories(id) on delete set null,
  type transaction_type not null,
  amount numeric(16,2) not null check (amount > 0),
  description text,
  transaction_date date not null default current_date,
  notes text,
  attachment_url text,
  is_recurring boolean not null default false,
  recurring_transaction_id uuid,
  transfer_group_id uuid,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table transactions enable row level security;
create policy "transactions_select_own" on transactions for select using (auth.uid() = user_id);
create policy "transactions_insert_own" on transactions for insert with check (auth.uid() = user_id);
create policy "transactions_update_own" on transactions for update using (auth.uid() = user_id);
create policy "transactions_delete_own" on transactions for delete using (auth.uid() = user_id);

create trigger trg_transactions_updated_at before update on transactions
  for each row execute function set_updated_at();

create index idx_transactions_user_id on transactions(user_id);
create index idx_transactions_date on transactions(transaction_date);
create index idx_transactions_account_id on transactions(account_id);
create index idx_transactions_category_id on transactions(category_id);

-- ---- balance maintenance triggers ----
create or replace function apply_transaction_balance()
returns trigger as $$
begin
  if new.type = 'expense' then
    update accounts set balance = balance - new.amount where id = new.account_id;
  elsif new.type = 'income' then
    update accounts set balance = balance + new.amount where id = new.account_id;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create or replace function revert_transaction_balance()
returns trigger as $$
begin
  if old.type = 'expense' then
    update accounts set balance = balance + old.amount where id = old.account_id;
  elsif old.type = 'income' then
    update accounts set balance = balance - old.amount where id = old.account_id;
  end if;
  return old;
end;
$$ language plpgsql security definer;

create trigger trg_apply_balance_insert
  after insert on transactions
  for each row execute function apply_transaction_balance();

create trigger trg_revert_balance_delete
  after delete on transactions
  for each row execute function revert_transaction_balance();

create or replace function handle_transaction_update_balance()
returns trigger as $$
begin
  -- revert old effect
  if old.type = 'expense' then
    update accounts set balance = balance + old.amount where id = old.account_id;
  elsif old.type = 'income' then
    update accounts set balance = balance - old.amount where id = old.account_id;
  end if;
  -- apply new effect
  if new.type = 'expense' then
    update accounts set balance = balance - new.amount where id = new.account_id;
  elsif new.type = 'income' then
    update accounts set balance = balance + new.amount where id = new.account_id;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger trg_update_balance_update
  after update of amount, type, account_id on transactions
  for each row execute function handle_transaction_update_balance();

-- ============================================================
-- TRANSFER RPC (atomic, safe)
-- ============================================================
create or replace function create_transfer(
  p_from_account uuid,
  p_to_account uuid,
  p_amount numeric,
  p_date date,
  p_description text
) returns uuid as $$
declare
  v_group_id uuid := uuid_generate_v4();
  v_user_id uuid := auth.uid();
begin
  if p_from_account = p_to_account then
    raise exception 'from and to account must be different';
  end if;
  if p_amount <= 0 then
    raise exception 'amount must be positive';
  end if;

  insert into transactions (user_id, account_id, type, amount, description, transaction_date, transfer_group_id)
  values (v_user_id, p_from_account, 'transfer', p_amount, p_description, p_date, v_group_id);

  insert into transactions (user_id, account_id, type, amount, description, transaction_date, transfer_group_id)
  values (v_user_id, p_to_account, 'transfer', p_amount, p_description, p_date, v_group_id);

  update accounts set balance = balance - p_amount where id = p_from_account and user_id = v_user_id;
  update accounts set balance = balance + p_amount where id = p_to_account and user_id = v_user_id;

  return v_group_id;
end;
$$ language plpgsql security definer;

-- ============================================================
-- BUDGETS
-- ============================================================
create table budgets (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  month integer not null check (month between 1 and 12),
  year integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, month, year)
);

alter table budgets enable row level security;
create policy "budgets_all_own" on budgets for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create trigger trg_budgets_updated_at before update on budgets
  for each row execute function set_updated_at();

create table budget_items (
  id uuid primary key default uuid_generate_v4(),
  budget_id uuid not null references budgets(id) on delete cascade,
  category_id uuid not null references categories(id) on delete cascade,
  amount numeric(16,2) not null check (amount >= 0),
  created_at timestamptz not null default now(),
  unique (budget_id, category_id)
);

alter table budget_items enable row level security;
create policy "budget_items_select" on budget_items for select
  using (exists (select 1 from budgets b where b.id = budget_id and b.user_id = auth.uid()));
create policy "budget_items_insert" on budget_items for insert
  with check (exists (select 1 from budgets b where b.id = budget_id and b.user_id = auth.uid()));
create policy "budget_items_update" on budget_items for update
  using (exists (select 1 from budgets b where b.id = budget_id and b.user_id = auth.uid()));
create policy "budget_items_delete" on budget_items for delete
  using (exists (select 1 from budgets b where b.id = budget_id and b.user_id = auth.uid()));

-- ============================================================
-- FINANCIAL GOALS
-- ============================================================
create table financial_goals (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  target_amount numeric(16,2) not null check (target_amount > 0),
  current_amount numeric(16,2) not null default 0,
  target_date date,
  description text,
  color text,
  icon text,
  is_achieved boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table financial_goals enable row level security;
create policy "goals_all_own" on financial_goals for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create trigger trg_goals_updated_at before update on financial_goals
  for each row execute function set_updated_at();

-- ============================================================
-- RECURRING TRANSACTIONS
-- ============================================================
create type recurring_frequency as enum ('daily','weekly','monthly','yearly');

create table recurring_transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  account_id uuid not null references accounts(id) on delete cascade,
  category_id uuid references categories(id) on delete set null,
  type transaction_type not null,
  amount numeric(16,2) not null check (amount > 0),
  description text,
  frequency recurring_frequency not null,
  next_execution_date date not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table recurring_transactions enable row level security;
create policy "recurring_all_own" on recurring_transactions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create trigger trg_recurring_updated_at before update on recurring_transactions
  for each row execute function set_updated_at();

alter table transactions
  add constraint fk_recurring_transaction
  foreign key (recurring_transaction_id) references recurring_transactions(id) on delete set null;

-- ============================================================
-- DEBTS
-- ============================================================
create type debt_type as enum ('i_owe','owed_to_me');
create type debt_status as enum ('active','partially_paid','paid','overdue');

create table debts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  person_name text not null,
  amount numeric(16,2) not null check (amount > 0),
  type debt_type not null,
  due_date date,
  description text,
  status debt_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table debts enable row level security;
create policy "debts_all_own" on debts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create trigger trg_debts_updated_at before update on debts
  for each row execute function set_updated_at();

create table debt_payments (
  id uuid primary key default uuid_generate_v4(),
  debt_id uuid not null references debts(id) on delete cascade,
  amount numeric(16,2) not null check (amount > 0),
  payment_date date not null default current_date,
  notes text,
  created_at timestamptz not null default now()
);

alter table debt_payments enable row level security;
create policy "debt_payments_select" on debt_payments for select
  using (exists (select 1 from debts d where d.id = debt_id and d.user_id = auth.uid()));
create policy "debt_payments_insert" on debt_payments for insert
  with check (exists (select 1 from debts d where d.id = debt_id and d.user_id = auth.uid()));
create policy "debt_payments_delete" on debt_payments for delete
  using (exists (select 1 from debts d where d.id = debt_id and d.user_id = auth.uid()));

-- keep debt status in sync with payments
create or replace function sync_debt_status()
returns trigger as $$
declare
  v_debt_amount numeric;
  v_total_paid numeric;
begin
  select amount into v_debt_amount from debts where id = coalesce(new.debt_id, old.debt_id);
  select coalesce(sum(amount),0) into v_total_paid from debt_payments where debt_id = coalesce(new.debt_id, old.debt_id);

  update debts set status = case
    when v_total_paid >= v_debt_amount then 'paid'
    when v_total_paid > 0 then 'partially_paid'
    else 'active'
  end
  where id = coalesce(new.debt_id, old.debt_id);

  return coalesce(new, old);
end;
$$ language plpgsql security definer;

create trigger trg_sync_debt_status_ins
  after insert on debt_payments for each row execute function sync_debt_status();
create trigger trg_sync_debt_status_del
  after delete on debt_payments for each row execute function sync_debt_status();

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
create type notification_type as enum ('budget_warning','budget_over','debt_due','goal_deadline','recurring_due');

create table notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type notification_type not null,
  title text not null,
  message text not null,
  is_read boolean not null default false,
  reference_id uuid,
  created_at timestamptz not null default now()
);

alter table notifications enable row level security;
create policy "notifications_all_own" on notifications for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index idx_notifications_user_id on notifications(user_id);
