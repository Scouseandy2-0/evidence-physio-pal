-- CRITICAL SECURITY FIX: Remove insecure patient access policy
-- The legacy policy allows access based on therapist_id OR assignment, creating a security bypass

-- Remove the insecure legacy policy that allows broader access
DROP POLICY IF EXISTS "Healthcare providers can access assigned patients (with legacy" ON public.patients;

-- Keep only the secure policy that requires proper assignment validation
-- This ensures patients can ONLY be accessed by healthcare providers who are:
-- 1. Properly verified (healthcare_role, license_verified, approved_for_patient_access)
-- 2. Explicitly assigned to the patient through patient_assignments table
-- 3. Have active assignments

-- The remaining policy "patients_secure_access" already provides secure access:
-- - SELECT/UPDATE/DELETE: Requires verified provider + active assignment
-- - INSERT: Requires verified provider + sets therapist_id to current user

-- Add enhanced audit logging function for patient access
CREATE OR REPLACE FUNCTION public.enhanced_patient_access_audit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only log if user is authenticated
  IF auth.uid() IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  -- Verify user has legitimate access before allowing the operation
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() 
      AND p.healthcare_role IS NOT NULL
      AND p.license_verified = true
      AND p.approved_for_patient_access = true
  ) THEN
    RAISE EXCEPTION 'Unauthorized access attempt to patient data';
  END IF;

  -- For patient table access, verify assignment
  IF TG_TABLE_NAME = 'patients' THEN
    DECLARE
      target_patient_id uuid;
    BEGIN
      target_patient_id := CASE 
        WHEN TG_OP = 'INSERT' THEN NEW.id
        WHEN TG_OP = 'UPDATE' THEN NEW.id
        WHEN TG_OP = 'DELETE' THEN OLD.id
        ELSE NULL
      END;
      
      -- Verify therapist assignment
      IF target_patient_id IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM public.patient_assignments pa
        WHERE pa.patient_id = target_patient_id
          AND pa.therapist_id = auth.uid()
          AND pa.is_active = true
      ) THEN
        RAISE EXCEPTION 'Access denied: Patient not assigned to current therapist';
      END IF;
    END;
  END IF;

  -- Log the access
  INSERT INTO public.patient_access_logs (
    user_id,
    patient_id,
    action,
    accessed_at
  ) VALUES (
    auth.uid(),
    CASE 
      WHEN TG_OP = 'INSERT' THEN NEW.id
      WHEN TG_OP = 'UPDATE' THEN NEW.id
      WHEN TG_OP = 'DELETE' THEN OLD.id
      ELSE NULL
    END,
    LOWER(TG_OP),
    now()
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Add trigger for enhanced patient access auditing
DROP TRIGGER IF EXISTS enhanced_patient_audit_trigger ON public.patients;
CREATE TRIGGER enhanced_patient_audit_trigger
  BEFORE INSERT OR UPDATE OR DELETE ON public.patients
  FOR EACH ROW
  EXECUTE FUNCTION public.enhanced_patient_access_audit();