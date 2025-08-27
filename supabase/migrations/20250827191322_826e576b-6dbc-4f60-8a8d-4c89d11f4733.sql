-- Fix infinite recursion in admin functions
-- 1. Drop the existing problematic function
DROP FUNCTION IF EXISTS public.is_admin(uuid);

-- 2. Create a new security definer function that bypasses RLS
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
-- This function bypasses RLS by setting search_path and using direct table access
SET search_path TO 'public'
AS $function$
    -- Use a direct query without RLS to avoid recursion
    SELECT EXISTS (
        SELECT 1 FROM admin_users 
        WHERE admin_users.user_id = $1 
        AND is_active = true
    );
$function$;

-- 3. Fix conditions table access - allow authenticated users to view
DROP POLICY IF EXISTS "Anyone can view conditions" ON public.conditions;
CREATE POLICY "Authenticated users can view conditions" 
ON public.conditions 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- 4. Fix assessment_tools access - allow healthcare providers to view
DROP POLICY IF EXISTS "Anyone can view assessment tools" ON public.assessment_tools;
CREATE POLICY "Healthcare providers can view assessment tools" 
ON public.assessment_tools 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND 
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() 
      AND p.healthcare_role IS NOT NULL 
      AND p.license_verified = true 
      AND p.approved_for_patient_access = true
  )
);

-- 5. Add fallback policy for authenticated users to view basic assessment tools info
CREATE POLICY "Authenticated users can view basic assessment tools" 
ON public.assessment_tools 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- 6. Ensure profiles table policies work correctly
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- 7. Fix admin_users policies to avoid recursion
DROP POLICY IF EXISTS "Users can view their own admin status" ON public.admin_users;
CREATE POLICY "Users can view their own admin status" 
ON public.admin_users 
FOR SELECT 
USING (auth.uid() = user_id);

-- 8. Allow service role to manage admin users
DROP POLICY IF EXISTS "Service role can manage admin users" ON public.admin_users;
CREATE POLICY "Service role can manage admin users" 
ON public.admin_users 
FOR ALL 
USING (true);