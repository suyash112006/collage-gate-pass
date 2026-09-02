-- 0000_create_profiles.sql

-- Create the profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('student', 'tg')),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 1. Users can view their own profile
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- 2. Users can update their own profile (excluding the role)
CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (
    auth.uid() = id 
    -- The role cannot be changed during an update. 
    -- If they try to pass a different role, it will fail or we omit it from the payload.
    -- (Supabase allows omitting columns, but if they include it and it differs, we want it to fail, 
    -- or we handle it via a secure function. For RLS, this ensures they can only update if they aren't changing the role,
    -- though PostgREST checks are tricky. A simpler approach is ensuring role isn't updated in the application layer,
    -- but for strict RLS, a trigger is best. However, restricting it here is good practice.)
);

-- Protect role column specifically via a trigger to prevent any UPDATE on role
CREATE OR REPLACE FUNCTION public.protect_profile_role()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.role IS DISTINCT FROM OLD.role THEN
        RAISE EXCEPTION 'Cannot change role after creation';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER tr_protect_profile_role
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.protect_profile_role();

-- Auto-update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- IMPORTANT: 
-- We do NOT add an INSERT policy for authenticated users because 
-- profiles will be inserted securely by our Next.js Server Actions 
-- using the Supabase Service Role Key (bypassing RLS) immediately after `auth.signUp()`.
-- This guarantees that a malicious client cannot insert a fake profile or spoof their role.
