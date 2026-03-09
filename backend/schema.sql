-- DebtWise AI Database Schema
-- Run this in Supabase SQL Editor to create all tables

-- Users table (extends Supabase auth.users)
create table if not exists public.users (
    id uuid primary key references auth.users(id) on delete cascade,
    email text unique not null,
    created_at timestamptz default now()
);

-- Debts table
create table if not exists public.debts (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.users(id) on delete cascade,
    provider text not null,
    balance numeric(12,2) not null default 0,
    interest_rate numeric(5,2) not null default 0,
    minimum_payment numeric(10,2) not null default 0,
    due_date date,
    debt_type text not null check (debt_type in ('bnpl', 'credit_card', 'loan', 'digital_loan')),
    created_at timestamptz default now()
);

-- Payments table
create table if not exists public.payments (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.users(id) on delete cascade,
    debt_id uuid not null references public.debts(id) on delete cascade,
    amount numeric(10,2) not null,
    payment_date date not null default current_date,
    created_at timestamptz default now()
);

-- Chat history table
create table if not exists public.chat_history (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.users(id) on delete cascade,
    message text not null,
    role text not null check (role in ('user', 'assistant')),
    created_at timestamptz default now()
);

-- Monthly insights table
create table if not exists public.monthly_insights (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.users(id) on delete cascade,
    summary text not null,
    created_at timestamptz default now()
);

-- Indexes
create index if not exists idx_debts_user_id on public.debts(user_id);
create index if not exists idx_payments_user_id on public.payments(user_id);
create index if not exists idx_payments_debt_id on public.payments(debt_id);
create index if not exists idx_chat_history_user_id on public.chat_history(user_id);
create index if not exists idx_monthly_insights_user_id on public.monthly_insights(user_id);

-- Row Level Security
alter table public.users enable row level security;
alter table public.debts enable row level security;
alter table public.payments enable row level security;
alter table public.chat_history enable row level security;
alter table public.monthly_insights enable row level security;

-- RLS Policies: users can only access their own data
create policy "Users can view own profile"
    on public.users for select using (auth.uid() = id);

create policy "Users can update own profile"
    on public.users for update using (auth.uid() = id);

create policy "Users can view own debts"
    on public.debts for select using (auth.uid() = user_id);

create policy "Users can insert own debts"
    on public.debts for insert with check (auth.uid() = user_id);

create policy "Users can update own debts"
    on public.debts for update using (auth.uid() = user_id);

create policy "Users can delete own debts"
    on public.debts for delete using (auth.uid() = user_id);

create policy "Users can view own payments"
    on public.payments for select using (auth.uid() = user_id);

create policy "Users can insert own payments"
    on public.payments for insert with check (auth.uid() = user_id);

create policy "Users can view own chat history"
    on public.chat_history for select using (auth.uid() = user_id);

create policy "Users can insert own chat messages"
    on public.chat_history for insert with check (auth.uid() = user_id);

create policy "Users can view own insights"
    on public.monthly_insights for select using (auth.uid() = user_id);

create policy "Users can insert own insights"
    on public.monthly_insights for insert with check (auth.uid() = user_id);

-- Function to auto-create user profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.users (id, email)
    values (new.id, new.email);
    return new;
end;
$$ language plpgsql security definer;

-- Trigger for auto-creating user profile
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();
