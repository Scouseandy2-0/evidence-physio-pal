-- Fix infinite recursion by properly handling dependencies
-- 1. Drop policies that depend on is_admin function first
DROP POLICY IF EXISTS "Admins can update all profile fields" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all patient assignments" ON public.patient_assignments;

-- 2. Now drop and recreate the is_admin function
DROP FUNCTION IF EXISTS public.is_admin(uuid) CASCADE;

-- 3. Create a new security definer function that properly bypasses RLS
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
    -- Direct query to admin_users table bypassing RLS
    SELECT EXISTS (
        SELECT 1 FROM admin_users 
        WHERE admin_users.user_id = $1 
        AND is_active = true
    );
$function$;

-- 4. Recreate the admin policies that were dropped
CREATE POLICY "Admins can update all profile fields" 
ON public.profiles 
FOR UPDATE 
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage all patient assignments" 
ON public.patient_assignments 
FOR ALL 
USING (public.is_admin(auth.uid()));

-- 5. Fix conditions table access - allow authenticated users to view
DROP POLICY IF EXISTS "Anyone can view conditions" ON public.conditions;
CREATE POLICY "Authenticated users can view conditions" 
ON public.conditions 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- 6. Fix assessment_tools access - allow authenticated users to view
DROP POLICY IF EXISTS "Anyone can view assessment tools" ON public.assessment_tools;
CREATE POLICY "Authenticated users can view assessment tools" 
ON public.assessment_tools 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- 7. Fix admin_users policies to avoid any potential recursion
DROP POLICY IF EXISTS "Users can view their own admin status" ON public.admin_users;
DROP POLICY IF EXISTS "Service role can manage admin users" ON public.admin_users;

CREATE POLICY "Users can view their own admin status" 
ON public.admin_users 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage admin users" 
ON public.admin_users 
FOR ALL 
USING (true);