-- CRITICAL SECURITY FIXES FOR PATIENT AND SUBSCRIPTION DATA

-- 1. Fix Patient Data RLS Policy - Replace overly broad access with strict assignment-based access
DROP POLICY IF EXISTS "Healthcare providers can access assigned patients (with legacy" ON public.patients;

-- Create strict assignment-based patient access policy
CREATE POLICY "Healthcare providers can only access assigned patients" 
ON public.patients 
FOR ALL 
USING (
  -- Must be authenticated
  auth.uid() IS NOT NULL 
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
  -- Must be specifically assigned to this patient
  EXISTS (
    SELECT 1 FROM public.patient_assignments pa 
    WHERE pa.patient_id = patients.id 
      AND pa.therapist_id = auth.uid() 
      AND pa.is_active = true
  )
);

-- 2. Secure Subscription Data - Remove dangerous email-based access
DROP POLICY IF EXISTS "select_own_subscription" ON public.subscribers;

-- Create secure user_id-only subscription access
CREATE POLICY "Users can only view their own subscription via user_id" 
ON public.subscribers 
FOR SELECT 
USING (auth.uid() = user_id);

-- 3. Secure Patient Access Logs - Admin and owner access only
DROP POLICY IF EXISTS "Healthcare providers can view their own access logs" ON public.patient_access_logs;

CREATE POLICY "Healthcare providers can view their own access logs" 
ON public.patient_access_logs 
FOR SELECT 
USING (
  auth.uid() = user_id 
  OR 
  public.is_admin(auth.uid())
);

-- 4. Add admin-only policy for viewing all patient access logs (audit purposes)
CREATE POLICY "Admins can view all patient access logs" 
ON public.patient_access_logs 
FOR SELECT 
USING (public.is_admin(auth.uid()));

-- 5. Strengthen profile protection - prevent enumeration attacks
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile only" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Add admin view policy for profiles (separate from user policy)
CREATE POLICY "Admins can view all profiles for verification" 
ON public.profiles 
FOR SELECT 
USING (public.is_admin(auth.uid()));

-- 6. Secure patient sessions - only assigned therapists can access
DROP POLICY IF EXISTS "Healthcare providers can manage sessions for their patients" ON public.patient_sessions;

CREATE POLICY "Healthcare providers can manage sessions for assigned patients only" 
ON public.patient_sessions 
FOR ALL 
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
);

-- 7. Add audit logging for sensitive profile updates
CREATE OR REPLACE FUNCTION public.audit_profile_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log sensitive healthcare credential changes
  IF (OLD.healthcare_role IS DISTINCT FROM NEW.healthcare_role) OR
     (OLD.license_verified IS DISTINCT FROM NEW.license_verified) OR
     (OLD.approved_for_patient_access IS DISTINCT FROM NEW.approved_for_patient_access) THEN
    
    INSERT INTO public.notifications (
      user_id,
      title,
      message,
      type,
      data
    ) VALUES (
      NEW.user_id,
      'Healthcare Credentials Updated',
      'Your healthcare credentials have been modified',
      'security',
      jsonb_build_object(
        'old_role', OLD.healthcare_role,
        'new_role', NEW.healthcare_role,
        'old_verified', OLD.license_verified,
        'new_verified', NEW.license_verified,
        'old_approved', OLD.approved_for_patient_access,
        'new_approved', NEW.approved_for_patient_access,
        'updated_by', auth.uid(),
        'updated_at', now()
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for profile audit logging
DROP TRIGGER IF EXISTS audit_profile_changes_trigger ON public.profiles;
CREATE TRIGGER audit_profile_changes_trigger
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_profile_changes();