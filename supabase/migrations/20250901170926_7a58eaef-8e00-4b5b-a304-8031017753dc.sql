-- CRITICAL SECURITY FIXES FOR PHYSIOEVIDENCE PROJECT
-- Phase 1: Healthcare Data Protection and Role Escalation Fixes

-- 1. DROP EXISTING CONFLICTING POLICIES ON PATIENTS TABLE
DROP POLICY IF EXISTS "Healthcare providers can access assigned patients (with legacy" ON public.patients;
DROP POLICY IF EXISTS "Secure patient access - assignment based only" ON public.patients;

-- 2. CREATE SIMPLIFIED, SECURE PATIENT ACCESS POLICY
CREATE POLICY "Secure patient access - verified therapists only" 
ON public.patients 
FOR ALL
TO authenticated
USING (
  -- Only verified healthcare providers can access patients
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() 
      AND p.healthcare_role IS NOT NULL
      AND p.license_verified = true 
      AND p.approved_for_patient_access = true
  )
  AND
  -- Must have active assignment to this specific patient
  EXISTS (
    SELECT 1 FROM public.patient_assignments pa
    WHERE pa.patient_id = patients.id
      AND pa.therapist_id = auth.uid()
      AND pa.is_active = true
  )
)
WITH CHECK (
  -- For inserts/updates, must be assigned therapist
  therapist_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() 
      AND p.healthcare_role IS NOT NULL
      AND p.license_verified = true 
      AND p.approved_for_patient_access = true
  )
);

-- 3. SECURE HEALTHCARE PROVIDER PROFILES - REMOVE BROAD ACCESS
DROP POLICY IF EXISTS "User profile self access only" ON public.profiles;

-- Create restricted profile access policy
CREATE POLICY "Restricted profile access" 
ON public.profiles 
FOR SELECT
TO authenticated
USING (
  -- Users can only see their own profile
  auth.uid() = user_id
  OR
  -- Verified admins can see all profiles for management
  (
    public.is_admin(auth.uid()) = true
    AND EXISTS (
      SELECT 1 FROM public.profiles admin_profile
      WHERE admin_profile.user_id = auth.uid()
        AND admin_profile.license_verified = true
    )
  )
);

-- 4. SECURE PATIENT SESSIONS - DROP DUPLICATE POLICIES
DROP POLICY IF EXISTS "Healthcare providers can manage sessions for assigned patients" ON public.patient_sessions;
DROP POLICY IF EXISTS "Secure session access - verified assignment only" ON public.patient_sessions;

-- Create single, secure patient session policy
CREATE POLICY "Secure patient session access" 
ON public.patient_sessions 
FOR ALL
TO authenticated
USING (
  -- Must be verified healthcare provider
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() 
      AND p.healthcare_role IS NOT NULL
      AND p.license_verified = true 
      AND p.approved_for_patient_access = true
  )
  AND
  -- Must have active assignment to patient
  EXISTS (
    SELECT 1 FROM public.patient_assignments pa
    JOIN public.patients pt ON pt.id = pa.patient_id
    WHERE pa.patient_id = patient_sessions.patient_id
      AND pa.therapist_id = auth.uid()
      AND pa.is_active = true
  )
)
WITH CHECK (
  -- Same verification for inserts/updates
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

-- 5. SECURE ADMIN ROLE ASSIGNMENT FUNCTION - PREVENT SELF-ESCALATION
CREATE OR REPLACE FUNCTION public.secure_assign_healthcare_role(
  target_user_id uuid, 
  new_role healthcare_role, 
  license_number text DEFAULT NULL::text, 
  department text DEFAULT NULL::text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- CRITICAL: Prevent self-escalation - user cannot modify their own role
    IF auth.uid() = target_user_id THEN
        RAISE EXCEPTION 'Security violation: Users cannot modify their own healthcare role';
    END IF;
    
    -- Check if caller is verified admin (not just any admin)
    IF NOT (
        public.is_admin(auth.uid()) = true 
        AND EXISTS (
            SELECT 1 FROM public.profiles p 
            WHERE p.user_id = auth.uid() 
              AND p.license_verified = true
        )
    ) THEN
        RAISE EXCEPTION 'Access denied: Only verified administrators can assign healthcare roles';
    END IF;
    
    -- Validate target user exists
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = target_user_id) THEN
        RAISE EXCEPTION 'Target user does not exist';
    END IF;
    
    -- Update the user's healthcare role
    UPDATE public.profiles 
    SET 
        healthcare_role = new_role,
        license_number = COALESCE(secure_assign_healthcare_role.license_number, profiles.license_number),
        department = COALESCE(secure_assign_healthcare_role.department, profiles.department),
        updated_at = now()
    WHERE user_id = target_user_id;
    
    -- Audit log the role assignment
    INSERT INTO public.notifications (
        user_id,
        title,
        message,
        type,
        data
    ) VALUES (
        target_user_id,
        'Healthcare Role Updated',
        'Your healthcare role has been updated by an administrator',
        'security',
        jsonb_build_object(
            'new_role', new_role,
            'assigned_by', auth.uid(),
            'assigned_at', now(),
            'security_check', 'verified_admin_only'
        )
    );
    
    RETURN true;
END;
$$;

-- 6. SECURE PATIENT ACCESS LOGS - ADMIN ONLY
DROP POLICY IF EXISTS "Healthcare providers can view their own access logs" ON public.patient_access_logs;

CREATE POLICY "Admin only patient access logs" 
ON public.patient_access_logs 
FOR SELECT
TO authenticated
USING (
  -- Only verified system administrators can view audit logs
  public.is_admin(auth.uid()) = true
  AND EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() 
      AND p.license_verified = true
  )
);

-- 7. SECURE SUBSCRIBERS DATA
CREATE POLICY "Strict subscriber data protection" 
ON public.subscribers 
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 8. CREATE SECURE ADMIN VERIFICATION FUNCTION
CREATE OR REPLACE FUNCTION public.is_verified_admin(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.admin_users au
        JOIN public.profiles p ON p.user_id = au.user_id
        WHERE au.user_id = $1 
          AND au.is_active = true
          AND p.license_verified = true
    );
$$;