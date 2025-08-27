-- Fix Security Definer View issue by removing problematic SECURITY DEFINER functions
-- and implementing safer alternatives

-- Drop the current secure_patient_view as it's not needed
DROP VIEW IF EXISTS public.secure_patient_view;

-- Update the healthcare provider verification function to NOT use SECURITY DEFINER
-- Instead, rely on RLS policies for proper access control
DROP FUNCTION IF EXISTS public.is_verified_healthcare_provider(uuid);

-- Create a safer version that works with RLS instead of bypassing it
CREATE OR REPLACE FUNCTION public.get_user_healthcare_status()
RETURNS TABLE(
  is_verified boolean,
  healthcare_role text,
  license_verified boolean,
  approved_for_access boolean
)
LANGUAGE sql
STABLE
SECURITY INVOKER  -- This is the key change - uses caller's permissions
SET search_path = 'public'
AS $$
  SELECT 
    (p.healthcare_role IS NOT NULL AND p.license_verified = true AND p.approved_for_patient_access = true) as is_verified,
    p.healthcare_role::text,
    p.license_verified,
    p.approved_for_patient_access
  FROM public.profiles p
  WHERE p.user_id = auth.uid();
$$;

-- Update RLS policies to use the new safer approach
-- Update patients table policy
DROP POLICY IF EXISTS "Verified healthcare providers can manage assigned patients" ON public.patients;

CREATE POLICY "Verified healthcare providers can manage assigned patients"
ON public.patients
FOR ALL
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

-- Update patient sessions policy  
DROP POLICY IF EXISTS "Verified healthcare providers can manage sessions for assigned patients" ON public.patient_sessions;

CREATE POLICY "Verified healthcare providers can manage sessions for assigned patients"
ON public.patient_sessions
FOR ALL
USING (
  EXISTS (
    SELECT 1 
    FROM public.patients pt 
    JOIN public.profiles p ON p.user_id = auth.uid()
    WHERE pt.id = patient_sessions.patient_id 
      AND pt.therapist_id = auth.uid()
      AND p.healthcare_role IS NOT NULL
      AND p.license_verified = true
      AND p.approved_for_patient_access = true
  )
);

-- Keep the audit logging function as SECURITY DEFINER since it needs elevated privileges
-- to insert into logs, but add additional security checks
DROP FUNCTION IF EXISTS public.log_patient_access();

CREATE OR REPLACE FUNCTION public.log_patient_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER  -- Needed for audit logging
SET search_path = 'public'
AS $$
BEGIN
  -- Additional security check: only log if user is authenticated
  IF auth.uid() IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  -- Log the access attempt with additional validation
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

-- Grant execute permission to authenticated users for the new function
GRANT EXECUTE ON FUNCTION public.get_user_healthcare_status() TO authenticated;

-- Add a comment explaining the security model
COMMENT ON FUNCTION public.get_user_healthcare_status() IS 
'Returns healthcare verification status for the current user. Uses SECURITY INVOKER to respect RLS policies.';

COMMENT ON FUNCTION public.log_patient_access() IS 
'Audit logging function. Uses SECURITY DEFINER only for logging purposes with additional security checks.';

-- Add additional constraint to ensure data integrity
ALTER TABLE public.profiles 
ADD CONSTRAINT check_healthcare_role_consistency 
CHECK (
  (healthcare_role IS NULL AND license_verified = false AND approved_for_patient_access = false)
  OR 
  (healthcare_role IS NOT NULL)
);