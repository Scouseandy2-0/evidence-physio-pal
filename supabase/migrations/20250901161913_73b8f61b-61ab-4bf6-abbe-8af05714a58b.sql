-- Emergency Security Fixes - Critical Patient Data Protection
-- Priority 1: Simplify and strengthen patient data access control

-- Drop existing complex patient RLS policies
DROP POLICY IF EXISTS "Healthcare providers can access assigned patients (with legacy" ON public.patients;
DROP POLICY IF EXISTS "Healthcare providers can only access assigned patients" ON public.patients;

-- Create simplified, secure patient access policy
CREATE POLICY "Secure patient access - assignment based only" 
ON public.patients 
FOR ALL 
TO authenticated
USING (
  -- Only allow access if:
  -- 1. User is verified healthcare provider
  -- 2. Patient is actively assigned to this therapist
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() 
      AND p.healthcare_role IS NOT NULL
      AND p.license_verified = true 
      AND p.approved_for_patient_access = true
  )
  AND EXISTS (
    SELECT 1 FROM public.patient_assignments pa
    WHERE pa.patient_id = patients.id 
      AND pa.therapist_id = auth.uid()
      AND pa.is_active = true
  )
)
WITH CHECK (
  -- Same conditions for inserts/updates
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() 
      AND p.healthcare_role IS NOT NULL
      AND p.license_verified = true 
      AND p.approved_for_patient_access = true
  )
  AND (
    -- For new patients, allow if user is verified
    therapist_id = auth.uid()
    OR
    -- For existing patients, check assignment
    EXISTS (
      SELECT 1 FROM public.patient_assignments pa
      WHERE pa.patient_id = patients.id 
        AND pa.therapist_id = auth.uid()
        AND pa.is_active = true
    )
  )
);

-- Priority 2: Lock down payment/subscription data
-- Replace permissive subscribers policies with strict user-only access
DROP POLICY IF EXISTS "Users can only view their own subscription via user_id" ON public.subscribers;
DROP POLICY IF EXISTS "insert_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "update_own_subscription" ON public.subscribers;

CREATE POLICY "Strict user subscription access" 
ON public.subscribers 
FOR ALL 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Priority 3: Strengthen healthcare provider profile protection
-- Replace admin-accessible policies with user-only access for sensitive data
DROP POLICY IF EXISTS "Admins can view all profiles for verification" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profile fields" ON public.profiles;

-- Users can view their own profile only
CREATE POLICY "User profile self access only" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Users can only update their own non-verification fields
CREATE POLICY "User profile self update - basic fields only" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id AND
  -- Prevent users from self-verifying or changing sensitive fields
  OLD.healthcare_role = NEW.healthcare_role AND
  OLD.license_verified = NEW.license_verified AND
  OLD.approved_for_patient_access = NEW.approved_for_patient_access
);

-- Separate policy for admin verification updates
CREATE POLICY "Admin verification updates only" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (
  is_admin(auth.uid()) AND
  -- Admins can only update verification fields, not personal data
  OLD.first_name = NEW.first_name AND
  OLD.last_name = NEW.last_name AND
  OLD.user_id = NEW.user_id
);

-- Priority 4: Enhance patient session security
-- Add additional validation to session access
DROP POLICY IF EXISTS "Healthcare providers can manage sessions for assigned patients" ON public.patient_sessions;

CREATE POLICY "Secure session access - verified assignment only" 
ON public.patient_sessions 
FOR ALL 
TO authenticated
USING (
  -- Must be verified healthcare provider with active assignment
  EXISTS (
    SELECT 1 FROM public.patient_assignments pa
    JOIN public.profiles p ON p.user_id = auth.uid()
    WHERE pa.patient_id = patient_sessions.patient_id 
      AND pa.therapist_id = auth.uid() 
      AND pa.is_active = true
      AND p.healthcare_role IS NOT NULL
      AND p.license_verified = true 
      AND p.approved_for_patient_access = true
  )
)
WITH CHECK (
  -- Same validation for inserts/updates
  EXISTS (
    SELECT 1 FROM public.patient_assignments pa
    JOIN public.profiles p ON p.user_id = auth.uid()
    WHERE pa.patient_id = patient_sessions.patient_id 
      AND pa.therapist_id = auth.uid() 
      AND pa.is_active = true
      AND p.healthcare_role IS NOT NULL
      AND p.license_verified = true 
      AND p.approved_for_patient_access = true
  )
);

-- Security Enhancement: Create function for secure admin profile access
CREATE OR REPLACE FUNCTION public.admin_get_provider_profiles()
RETURNS TABLE(
  user_id uuid,
  healthcare_role public.healthcare_role,
  license_verified boolean,
  approved_for_patient_access boolean,
  license_number text,
  professional_title text,
  created_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  -- Only allow admins to call this function
  SELECT 
    p.user_id,
    p.healthcare_role,
    p.license_verified,
    p.approved_for_patient_access,
    p.license_number,
    p.professional_title,
    p.created_at
  FROM public.profiles p
  WHERE is_admin(auth.uid())
    AND p.healthcare_role IS NOT NULL;
$$;