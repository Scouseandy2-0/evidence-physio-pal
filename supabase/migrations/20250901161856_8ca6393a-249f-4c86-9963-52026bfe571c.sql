-- Emergency Security Fixes - Critical Patient Data Protection

-- Priority 1: Simplify and strengthen patient data access control
DROP POLICY IF EXISTS "Healthcare providers can access assigned patients (with legacy" ON public.patients;
DROP POLICY IF EXISTS "Healthcare providers can only access assigned patients" ON public.patients;

CREATE POLICY "Secure patient access - assignment based only" 
ON public.patients 
FOR ALL 
TO authenticated
USING (
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
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() 
      AND p.healthcare_role IS NOT NULL
      AND p.license_verified = true 
      AND p.approved_for_patient_access = true
  )
  AND therapist_id = auth.uid()
);

-- Priority 2: Lock down payment/subscription data
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
DROP POLICY IF EXISTS "Admins can view all profiles for verification" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profile fields" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile only" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their basic profile info" ON public.profiles;

-- Users can view their own profile only
CREATE POLICY "User profile self access only" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Users can only update their own basic fields (no verification fields)
CREATE POLICY "User profile basic updates only" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

-- Admin can update all fields for verification
CREATE POLICY "Admin profile verification updates" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (is_admin(auth.uid()));

-- Priority 4: Enhance patient session security
DROP POLICY IF EXISTS "Healthcare providers can manage sessions for assigned patients" ON public.patient_sessions;

CREATE POLICY "Secure session access - verified assignment only" 
ON public.patient_sessions 
FOR ALL 
TO authenticated
USING (
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