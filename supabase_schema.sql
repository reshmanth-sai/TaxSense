-- ============================================================================
-- TAXSENSE PHASE 1 DATABASE SCHEMA & ROW LEVEL SECURITY (RLS) POLICIES
-- Run this script inside your Supabase Dashboard -> SQL Editor
-- ============================================================================

-- 1. Profiles Table (Linked to Auth Users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  pan_number TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tax Returns Table (Stores Assessment Year Tax Calculations)
CREATE TABLE IF NOT EXISTS public.tax_returns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  assessment_year TEXT NOT NULL DEFAULT '2026-27',
  regime_preference TEXT DEFAULT 'NEW',
  gross_salary NUMERIC(12, 2) DEFAULT 0,
  deductions_80c NUMERIC(12, 2) DEFAULT 0,
  deductions_80d NUMERIC(12, 2) DEFAULT 0,
  deductions_other NUMERIC(12, 2) DEFAULT 0,
  tds_deducted NUMERIC(12, 2) DEFAULT 0,
  calculated_tax NUMERIC(12, 2) DEFAULT 0,
  raw_tax_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Document Vault Table (Stores Metadata for Uploaded Form 16 / Proofs)
CREATE TABLE IF NOT EXISTS public.vault_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_size INT NOT NULL,
  file_type TEXT NOT NULL,
  file_path TEXT NOT NULL,
  parsed_metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vault_documents ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

DROP POLICY IF EXISTS "Users can view own tax returns" ON public.tax_returns;
DROP POLICY IF EXISTS "Users can insert own tax returns" ON public.tax_returns;
DROP POLICY IF EXISTS "Users can update own tax returns" ON public.tax_returns;
DROP POLICY IF EXISTS "Users can delete own tax returns" ON public.tax_returns;

DROP POLICY IF EXISTS "Users can view own vault documents" ON public.vault_documents;
DROP POLICY IF EXISTS "Users can insert own vault documents" ON public.vault_documents;
DROP POLICY IF EXISTS "Users can delete own vault documents" ON public.vault_documents;

-- Profiles RLS Policies
CREATE POLICY "Users can view own profile" 
  ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Tax Returns RLS Policies
CREATE POLICY "Users can view own tax returns" 
  ON public.tax_returns FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tax returns" 
  ON public.tax_returns FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tax returns" 
  ON public.tax_returns FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tax returns" 
  ON public.tax_returns FOR DELETE USING (auth.uid() = user_id);

-- Vault Documents RLS Policies
CREATE POLICY "Users can view own vault documents" 
  ON public.vault_documents FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own vault documents" 
  ON public.vault_documents FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own vault documents" 
  ON public.vault_documents FOR DELETE USING (auth.uid() = user_id);
