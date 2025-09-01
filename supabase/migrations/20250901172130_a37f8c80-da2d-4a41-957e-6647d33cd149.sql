-- FORCE REMOVE the problematic policy with exact name match
DROP POLICY "Healthcare providers can access assigned patients (with legacy " ON public.patients;

-- Create a completely new secure policy to replace any remaining issues
DROP POLICY IF EXISTS "patients_secure_access" ON public.patients;

CREATE POLICY "patients_strict_access_only" 
ON public.patients 
FOR ALL
TO authenticated
USING (
  -- User must be a verified healthcare provider
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() 
      AND p.healthcare_role IS NOT NULL
      AND p.license_verified = true 
      AND p.approved_for_patient_access = true
  )
  AND
  -- Patient must be explicitly assigned to the user
  EXISTS (
    SELECT 1 FROM public.patient_assignments pa
    WHERE pa.patient_id = patients.id
      AND pa.therapist_id = auth.uid()
      AND pa.is_active = true
  )
)
WITH CHECK (
  -- For inserts, ensure therapist_id is set to current user
  therapist_id = auth.uid()
  AND
  -- And user must be verified
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() 
      AND p.healthcare_role IS NOT NULL
      AND p.license_verified = true 
      AND p.approved_for_patient_access = true
  )
);