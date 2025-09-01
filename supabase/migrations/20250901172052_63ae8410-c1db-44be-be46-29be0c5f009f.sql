-- CRITICAL SECURITY FIX: Remove insecure patient access policy
-- The legacy policy contains a dangerous OR condition that bypasses assignment verification

-- Remove the legacy policy with insecure fallback condition
DROP POLICY IF EXISTS "Healthcare providers can access assigned patients (with legacy" ON public.patients;

-- Verify the secure policy remains - it only allows access through proper assignments
-- The remaining "patients_secure_access" policy ensures:
-- 1. User must be a verified healthcare provider
-- 2. Patient must be explicitly assigned to the user via patient_assignments table
-- 3. Assignment must be active

-- Add additional security audit function
CREATE OR REPLACE FUNCTION public.audit_profile_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log sensitive healthcare credential changes
  IF (OLD.healthcare_role IS DISTINCT FROM NEW.healthcare_role) OR
     (OLD.license_verified IS DISTINCT FROM NEW.license_verified) OR
     (OLD.approved_for_patient_access IS DISTINCT FROM NEW.approved_for_patient_access) THEN
    
    INSERT INTO public.notifications (
      user_id,
      title,
      message,
      type,
      data
    ) VALUES (
      NEW.user_id,
      'Healthcare Credentials Updated',
      'Your healthcare credentials have been modified',
      'security',
      jsonb_build_object(
        'old_role', OLD.healthcare_role,
        'new_role', NEW.healthcare_role,
        'old_verified', OLD.license_verified,
        'new_verified', NEW.license_verified,
        'old_approved', OLD.approved_for_patient_access,
        'new_approved', NEW.approved_for_patient_access,
        'updated_by', auth.uid(),
        'updated_at', now()
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Add trigger for profile changes audit
DROP TRIGGER IF EXISTS audit_profile_changes_trigger ON public.profiles;
CREATE TRIGGER audit_profile_changes_trigger
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_profile_changes();