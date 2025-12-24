-- Fix security issue: Add DELETE policy for profiles table
CREATE POLICY "Users can delete their own profile"
ON public.profiles
FOR DELETE
USING (auth.uid() = user_id);

-- Ensure all existing profiles have a tenant_id
UPDATE public.profiles
SET tenant_id = gen_random_uuid()
WHERE tenant_id IS NULL OR tenant_id = '';

-- Make tenant_id NOT NULL after setting values
ALTER TABLE public.profiles
ALTER COLUMN tenant_id SET NOT NULL;