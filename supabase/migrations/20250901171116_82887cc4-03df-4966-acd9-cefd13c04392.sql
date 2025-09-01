-- CRITICAL SECURITY FIXES - Phase 1: Clean Slate Approach
-- First drop ALL existing policies, then recreate secure ones

-- 1. CLEAN UP PATIENTS TABLE POLICIES
DROP POLICY IF EXISTS "Secure patient access - verified therapists only" ON public.patients;
DROP POLICY IF EXISTS "Healthcare providers can access assigned patients (with legacy" ON public.patients;
DROP POLICY IF EXISTS "Secure patient access - assignment based only" ON public.patients;

-- 2. CLEAN UP PROFILES TABLE POLICIES  
DROP POLICY IF EXISTS "Restricted profile access" ON public.profiles;
DROP POLICY IF EXISTS "User profile self access only" ON public.profiles;
DROP POLICY IF EXISTS "User profile basic updates only" ON public.profiles;
DROP POLICY IF EXISTS "Admin profile verification updates" ON public.profiles;

-- 3. CLEAN UP PATIENT SESSIONS POLICIES
DROP POLICY IF EXISTS "Secure patient session access" ON public.patient_sessions;
DROP POLICY IF EXISTS "Healthcare providers can manage sessions for assigned patients" ON public.patient_sessions;
DROP POLICY IF EXISTS "Secure session access - verified assignment only" ON public.patient_sessions;

-- 4. CLEAN UP PATIENT ACCESS LOGS POLICIES
DROP POLICY IF EXISTS "Admin only patient access logs" ON public.patient_access_logs;
DROP POLICY IF EXISTS "Healthcare providers can view their own access logs" ON public.patient_access_logs;
DROP POLICY IF EXISTS "Admins can view all patient access logs" ON public.patient_access_logs;

-- 5. CLEAN UP SUBSCRIBERS POLICIES
DROP POLICY IF EXISTS "Strict subscriber data protection" ON public.subscribers;
DROP POLICY IF EXISTS "Strict user subscription access" ON public.subscribers;

-- Now create NEW SECURE POLICIES

-- PATIENTS TABLE - Single secure policy
CREATE POLICY "patients_secure_access" 
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
  AND
  EXISTS (
    SELECT 1 FROM public.patient_assignments pa
    WHERE pa.patient_id = patients.id
      AND pa.therapist_id = auth.uid()
      AND pa.is_active = true
  )
)
WITH CHECK (
  therapist_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() 
      AND p.healthcare_role IS NOT NULL
      AND p.license_verified = true 
      AND p.approved_for_patient_access = true
  )
);

-- PROFILES TABLE - Secure profile access
CREATE POLICY "profiles_secure_access" 
ON public.profiles 
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
  OR
  public.is_admin(auth.uid()) = true
);

CREATE POLICY "profiles_self_update" 
ON public.profiles 
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profiles_admin_update" 
ON public.profiles 
FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()) = true);

CREATE POLICY "profiles_self_insert" 
ON public.profiles 
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- PATIENT SESSIONS - Secure session access
CREATE POLICY "patient_sessions_secure_access" 
ON public.patient_sessions 
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
  AND
  EXISTS (
    SELECT 1 FROM public.patient_assignments pa
    WHERE pa.patient_id = patient_sessions.patient_id
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
  AND
  EXISTS (
    SELECT 1 FROM public.patient_assignments pa
    WHERE pa.patient_id = patient_sessions.patient_id
      AND pa.therapist_id = auth.uid()
      AND pa.is_active = true
  )
);

-- PATIENT ACCESS LOGS - Admin only
CREATE POLICY "patient_access_logs_admin_only" 
ON public.patient_access_logs 
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()) = true);

-- SUBSCRIBERS - Strict user-only access
CREATE POLICY "subscribers_user_only_access" 
ON public.subscribers 
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);