-- CRITICAL SECURITY FIX: Secure Admin Role Assignment
-- Replace existing vulnerable function with secure version

DROP FUNCTION IF EXISTS public.assign_healthcare_role(uuid, healthcare_role, text, text);

CREATE OR REPLACE FUNCTION public.secure_assign_healthcare_role(
  target_user_id uuid, 
  new_role healthcare_role, 
  license_number text DEFAULT NULL::text, 
  department text DEFAULT NULL::text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- CRITICAL: Prevent self-escalation - user cannot modify their own role
    IF auth.uid() = target_user_id THEN
        RAISE EXCEPTION 'Security violation: Users cannot modify their own healthcare role';
    END IF;
    
    -- Check if caller is verified admin
    IF NOT public.is_admin(auth.uid()) THEN
        RAISE EXCEPTION 'Access denied: Only administrators can assign healthcare roles';
    END IF;
    
    -- Validate target user exists
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = target_user_id) THEN
        RAISE EXCEPTION 'Target user does not exist';
    END IF;
    
    -- Update the user's healthcare role
    UPDATE public.profiles 
    SET 
        healthcare_role = new_role,
        license_number = COALESCE(secure_assign_healthcare_role.license_number, profiles.license_number),
        department = COALESCE(secure_assign_healthcare_role.department, profiles.department),
        updated_at = now()
    WHERE user_id = target_user_id;
    
    -- Audit log the role assignment
    INSERT INTO public.notifications (
        user_id,
        title,
        message,
        type,
        data
    ) VALUES (
        target_user_id,
        'Healthcare Role Updated',
        'Your healthcare role has been updated by an administrator',
        'security',
        jsonb_build_object(
            'new_role', new_role,
            'assigned_by', auth.uid(),
            'assigned_at', now(),
            'security_check', 'verified_admin_only'
        )
    );
    
    RETURN true;
END;
$$;

-- Fix the leaked password protection warning by enabling it
-- Note: This requires Supabase project settings to be updated