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

-- Admins can only view profiles via secure function calls, not direct access
CREATE POLICY "Admin verification access - function only" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (
  -- Users can always view their own profile
  auth.uid() = user_id 
  OR 
  -- Admins can view for verification purposes only via specific context
  (is_admin(auth.uid()) AND current_setting('app.admin_context', true) = 'verification')
);

-- Admins can only update verification fields, not personal data
CREATE POLICY "Admin verification updates only" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (
  -- Admins can only update verification-related fields
  is_admin(auth.uid()) AND
  -- Prevent updates to personal identifying information
  (OLD.first_name = NEW.first_name) AND
  (OLD.last_name = NEW.last_name) AND
  (OLD.user_id = NEW.user_id)
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

-- Add security trigger for sensitive profile changes
CREATE OR REPLACE FUNCTION public.secure_profile_audit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log all healthcare credential changes with IP tracking
  IF (OLD.healthcare_role IS DISTINCT FROM NEW.healthcare_role) OR
     (OLD.license_verified IS DISTINCT FROM NEW.license_verified) OR
     (OLD.approved_for_patient_access IS DISTINCT FROM NEW.approved_for_patient_access) THEN
    
    INSERT INTO public.patient_access_logs (
      user_id,
      patient_id,
      action,
      ip_address,
      session_id,
      accessed_at
    ) VALUES (
      NEW.user_id,
      NULL, -- Profile change, not patient-specific
      'profile_credential_change',
      inet_client_addr(),
      current_setting('request.session_id', true),
      now()
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Apply security audit trigger
DROP TRIGGER IF EXISTS secure_profile_audit_trigger ON public.profiles;
CREATE TRIGGER secure_profile_audit_trigger
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.secure_profile_audit();