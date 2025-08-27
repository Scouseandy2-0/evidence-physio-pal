-- Enhanced Patient Access Security Fix
-- This migration strengthens patient data protection with multiple layers of security

-- 1. Add patient assignment audit table for tracking legitimate access
CREATE TABLE IF NOT EXISTS public.patient_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL,
  therapist_id uuid NOT NULL,
  assigned_by uuid NOT NULL, -- Who made the assignment (admin/supervisor)
  assigned_at timestamp with time zone NOT NULL DEFAULT now(),
  is_active boolean NOT NULL DEFAULT true,
  assignment_reason text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on patient assignments
ALTER TABLE public.patient_assignments ENABLE ROW LEVEL SECURITY;

-- 2. Create stricter RLS policies for patients table
DROP POLICY IF EXISTS "Verified healthcare providers can manage assigned patients" ON public.patients;

-- New policy with enhanced verification including assignment tracking
CREATE POLICY "Healthcare providers can only access explicitly assigned patients"
ON public.patients
FOR ALL
USING (
  -- Must be the assigned therapist
  auth.uid() = therapist_id
  AND
  -- Must be a verified healthcare provider
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() 
      AND p.healthcare_role IS NOT NULL
      AND p.license_verified = true
      AND p.approved_for_patient_access = true
  )
  AND
  -- Must have an active assignment record (additional verification)
  EXISTS (
    SELECT 1 FROM public.patient_assignments pa
    WHERE pa.patient_id = patients.id
      AND pa.therapist_id = auth.uid()
      AND pa.is_active = true
  )
);

-- 3. Create policy for patient assignments table
CREATE POLICY "Healthcare providers can view their own assignments"
ON public.patient_assignments
FOR SELECT
USING (
  auth.uid() = therapist_id
  AND EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() 
      AND p.healthcare_role IS NOT NULL
      AND p.license_verified = true
      AND p.approved_for_patient_access = true
  )
);

-- Admins can manage all assignments
CREATE POLICY "Admins can manage all patient assignments"
ON public.patient_assignments
FOR ALL
USING (public.is_admin(auth.uid()));

-- 4. Create function to safely assign patients with proper authorization
CREATE OR REPLACE FUNCTION public.assign_patient_to_therapist(
  patient_id uuid,
  therapist_id uuid,
  assignment_reason text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  patient_exists boolean;
  therapist_verified boolean;
BEGIN
  -- Check if caller is admin or authorized supervisor
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only administrators can assign patients to therapists';
  END IF;
  
  -- Verify patient exists
  SELECT EXISTS(SELECT 1 FROM public.patients WHERE id = patient_id) INTO patient_exists;
  IF NOT patient_exists THEN
    RAISE EXCEPTION 'Patient does not exist';
  END IF;
  
  -- Verify therapist is properly verified
  SELECT EXISTS(
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = therapist_id 
      AND p.healthcare_role IS NOT NULL
      AND p.license_verified = true
      AND p.approved_for_patient_access = true
  ) INTO therapist_verified;
  
  IF NOT therapist_verified THEN
    RAISE EXCEPTION 'Therapist is not properly verified for patient access';
  END IF;
  
  -- Update patient's therapist_id
  UPDATE public.patients 
  SET therapist_id = assign_patient_to_therapist.therapist_id,
      updated_at = now()
  WHERE id = assign_patient_to_therapist.patient_id;
  
  -- Create assignment record
  INSERT INTO public.patient_assignments (
    patient_id,
    therapist_id,
    assigned_by,
    assignment_reason
  ) VALUES (
    assign_patient_to_therapist.patient_id,
    assign_patient_to_therapist.therapist_id,
    auth.uid(),
    assign_patient_to_therapist.assignment_reason
  );
  
  -- Log the assignment
  INSERT INTO public.notifications (
    user_id,
    title,
    message,
    type,
    data
  ) VALUES (
    assign_patient_to_therapist.therapist_id,
    'New Patient Assigned',
    'A new patient has been assigned to your care',
    'system',
    jsonb_build_object(
      'patient_id', assign_patient_to_therapist.patient_id,
      'assigned_by', auth.uid(),
      'assigned_at', now()
    )
  );
  
  RETURN true;
END;
$$;

-- 5. Enhanced audit trigger for patient access
CREATE OR REPLACE FUNCTION public.enhanced_patient_access_audit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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

-- 6. Apply enhanced audit trigger to patients table
DROP TRIGGER IF EXISTS audit_patient_access ON public.patients;
CREATE TRIGGER audit_patient_access
  BEFORE INSERT OR UPDATE OR DELETE ON public.patients
  FOR EACH ROW EXECUTE FUNCTION public.enhanced_patient_access_audit();

-- 7. Strengthen patient_sessions RLS policy too
DROP POLICY IF EXISTS "Verified healthcare providers can manage sessions for assigned patients" ON public.patient_sessions;

CREATE POLICY "Healthcare providers can only manage sessions for assigned patients"
ON public.patient_sessions
FOR ALL
USING (
  EXISTS (
    SELECT 1 
    FROM public.patients pt 
    JOIN public.profiles p ON p.user_id = auth.uid()
    JOIN public.patient_assignments pa ON pa.patient_id = pt.id
    WHERE pt.id = patient_sessions.patient_id 
      AND pt.therapist_id = auth.uid()
      AND pa.therapist_id = auth.uid()
      AND pa.is_active = true
      AND p.healthcare_role IS NOT NULL
      AND p.license_verified = true
      AND p.approved_for_patient_access = true
  )
);

-- 8. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_patient_assignments_patient_therapist 
ON public.patient_assignments(patient_id, therapist_id) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_patient_assignments_therapist 
ON public.patient_assignments(therapist_id) WHERE is_active = true;

-- 9. Create trigger for patient assignments audit
CREATE TRIGGER update_patient_assignments_updated_at
  BEFORE UPDATE ON public.patient_assignments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 10. Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.assign_patient_to_therapist(uuid, uuid, text) TO authenticated;

-- Comments for documentation
COMMENT ON TABLE public.patient_assignments IS 'Tracks explicit patient-to-therapist assignments for enhanced security and audit trail';
COMMENT ON FUNCTION public.assign_patient_to_therapist(uuid, uuid, text) IS 'Securely assigns patients to therapists with proper authorization checks';
COMMENT ON FUNCTION public.enhanced_patient_access_audit() IS 'Enhanced audit function that validates patient assignments before allowing access';