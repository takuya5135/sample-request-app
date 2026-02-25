-- Fix the RLS policy for profiles table update

-- 1. Drop the incorrect policy if it exists
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- 2. Create the correct policy using standard logic
CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id) 
WITH CHECK (auth.uid() = id);

-- Ensure the columns were created correctly
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company_name text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_name text;
