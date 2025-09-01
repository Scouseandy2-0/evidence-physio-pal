-- CRITICAL SECURITY FIXES - Final Phase
-- Remove remaining duplicate policies and add role escalation prevention

-- Remove duplicate patient policies
DROP POLICY IF EXISTS "Healthcare providers can access assigned patients (with legacy" ON public.patients;

-- Remove duplicate patient session policies  
DROP POLICY IF EXISTS "Healthcare providers can manage sessions for assigned patients" ON public.patient_sessions;

-- Add secure role assignment function with self-escalation prevention
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
    -- CRITICAL: Prevent self-escalation
    IF auth.uid() = target_user_id THEN
        RAISE EXCEPTION 'Security violation: Users cannot modify their own healthcare role';
    END IF;
    
    -- Require verified admin
    IF NOT public.is_admin(auth.uid()) THEN
        RAISE EXCEPTION 'Access denied: Only administrators can assign healthcare roles';
    END IF;
    
    -- Validate target user exists
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = target_user_id) THEN
        RAISE EXCEPTION 'Target user does not exist';
    END IF;
    
    -- Update role
    UPDATE public.profiles 
    SET 
        healthcare_role = new_role,
        license_number = COALESCE(secure_assign_healthcare_role.license_number, profiles.license_number),
        department = COALESCE(secure_assign_healthcare_role.department, profiles.department),
        updated_at = now()
    WHERE user_id = target_user_id;
    
    -- Audit log
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
            'security_check', 'self_escalation_prevented'
        )
    );
    
    RETURN true;
END;
$$;

-- Replace the existing insecure function
DROP FUNCTION IF EXISTS public.assign_healthcare_role(uuid, healthcare_role, text, text);

-- Create function to prevent profile tampering
CREATE OR REPLACE FUNCTION public.validate_profile_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Prevent users from self-verifying or escalating privileges
  IF OLD.user_id = auth.uid() THEN
    -- Users can update basic info but not verification status
    IF (OLD.license_verified IS DISTINCT FROM NEW.license_verified) OR
       (OLD.approved_for_patient_access IS DISTINCT FROM NEW.approved_for_patient_access) THEN
      RAISE EXCEPTION 'Security violation: Users cannot self-verify credentials';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Add trigger to prevent self-verification
DROP TRIGGER IF EXISTS prevent_self_verification ON public.profiles;
CREATE TRIGGER prevent_self_verification
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_profile_update();

-- Secure analytics sessions access
CREATE POLICY "analytics_sessions_therapist_only" 
ON public.analytics_sessions 
FOR ALL
TO authenticated
USING (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() 
      AND p.healthcare_role IS NOT NULL
      AND p.license_verified = true 
      AND p.approved_for_patient_access = true
  )
)
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() 
      AND p.healthcare_role IS NOT NULL
      AND p.license_verified = true 
      AND p.approved_for_patient_access = true
  )
);