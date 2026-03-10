-- DebtWise AI Database Schema
-- Run this in Supabase SQL Editor or via init_db.py

-- Users table (simple application-managed auth)
CREATE TABLE IF NOT EXISTS public.users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email text UNIQUE NOT NULL,
    password_hash text NOT NULL,
    is_admin boolean NOT NULL DEFAULT false,
    created_at timestamptz DEFAULT now()
);

-- Debts table
CREATE TABLE IF NOT EXISTS public.debts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    provider text NOT NULL,
    balance numeric(12,2) NOT NULL DEFAULT 0,
    interest_rate numeric(5,2) NOT NULL DEFAULT 0,
    minimum_payment numeric(10,2) NOT NULL DEFAULT 0,
    due_date date,
    debt_type text NOT NULL CHECK (debt_type IN ('bnpl', 'credit_card', 'loan', 'digital_loan')),
    created_at timestamptz DEFAULT now()
);

-- Payments table
CREATE TABLE IF NOT EXISTS public.payments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    debt_id uuid NOT NULL REFERENCES public.debts(id) ON DELETE CASCADE,
    amount numeric(10,2) NOT NULL,
    payment_date date NOT NULL DEFAULT current_date,
    created_at timestamptz DEFAULT now()
);

-- Chat history table
CREATE TABLE IF NOT EXISTS public.chat_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    message text NOT NULL,
    role text NOT NULL CHECK (role IN ('user', 'assistant')),
    created_at timestamptz DEFAULT now()
);

-- Monthly insights table
CREATE TABLE IF NOT EXISTS public.monthly_insights (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    summary text NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_debts_user_id ON public.debts(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_debt_id ON public.payments(debt_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_user_id ON public.chat_history(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_insights_user_id ON public.monthly_insights(user_id);
