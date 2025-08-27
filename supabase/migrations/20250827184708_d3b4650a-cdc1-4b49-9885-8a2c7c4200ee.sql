-- Fix security warnings from the linter

-- Fix function search path issues by adding SET search_path
ALTER FUNCTION public.is_verified_healthcare_provider(uuid) 
SET search_path = 'public';

ALTER FUNCTION public.log_patient_access() 
SET search_path = 'public';

-- Remove the security definer view and replace with a regular view
DROP VIEW IF EXISTS public.secure_patient_view;

-- Create a regular view instead (no SECURITY DEFINER)
CREATE OR REPLACE VIEW public.secure_patient_view AS
SELECT 
  p.id,
  p.patient_id,
  p.first_name,
  p.last_name,
  p.date_of_birth,
  p.primary_condition,
  p.status,
  p.created_at,
  p.updated_at,
  p.therapist_id
FROM public.patients p
WHERE p.therapist_id = auth.uid()
  AND public.is_verified_healthcare_provider(auth.uid());

-- Enable RLS on the view
ALTER VIEW public.secure_patient_view SET (security_barrier = true);

-- Grant access to the view
GRANT SELECT ON public.secure_patient_view TO authenticated;