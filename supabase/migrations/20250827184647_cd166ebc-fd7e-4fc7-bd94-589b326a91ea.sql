-- Enhanced security for patient data access (fixed migration)

-- Only create the enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE public.healthcare_role AS ENUM (
      'physiotherapist',
      'doctor', 
      'nurse',
      'occupational_therapist',
      'speech_therapist',
      'admin'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add healthcare verification columns to profiles table if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'healthcare_role') THEN
        ALTER TABLE public.profiles ADD COLUMN healthcare_role public.healthcare_role;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'license_number') THEN
        ALTER TABLE public.profiles ADD COLUMN license_number text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'license_verified') THEN
        ALTER TABLE public.profiles ADD COLUMN license_verified boolean DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'license_expiry_date') THEN
        ALTER TABLE public.profiles ADD COLUMN license_expiry_date date;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'department') THEN
        ALTER TABLE public.profiles ADD COLUMN department text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'approved_for_patient_access') THEN
        ALTER TABLE public.profiles ADD COLUMN approved_for_patient_access boolean DEFAULT false;
    END IF;
END $$;

-- Create audit log table for patient data access if it doesn't exist
CREATE TABLE IF NOT EXISTS public.patient_access_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_id uuid REFERENCES public.patients(id) ON DELETE CASCADE,
  action text NOT NULL, -- 'view', 'edit', 'create', 'delete'
  accessed_at timestamp with time zone DEFAULT now(),
  ip_address inet,
  user_agent text,
  session_id text
);

-- Enable RLS on audit log
ALTER TABLE public.patient_access_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Healthcare providers can view their own access logs" ON public.patient_access_logs;
DROP POLICY IF EXISTS "System can insert audit logs" ON public.patient_access_logs;

-- Create audit log policies
CREATE POLICY "Healthcare providers can view their own access logs"
ON public.patient_access_logs
FOR SELECT
USING (auth.uid() = user_id);

-- Only system can insert audit logs
CREATE POLICY "System can insert audit logs"
ON public.patient_access_logs
FOR INSERT
WITH CHECK (true);

-- Create function to verify healthcare provider status
CREATE OR REPLACE FUNCTION public.is_verified_healthcare_provider(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE user_id = user_uuid 
      AND healthcare_role IS NOT NULL
      AND license_verified = true
      AND approved_for_patient_access = true
      AND (license_expiry_date IS NULL OR license_expiry_date > CURRENT_DATE)
  );
$$;

-- Create function to log patient access
CREATE OR REPLACE FUNCTION public.log_patient_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Log the access attempt
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

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS log_patient_access_trigger ON public.patients;
DROP TRIGGER IF EXISTS log_patient_session_access_trigger ON public.patient_sessions;

-- Create triggers for audit logging
CREATE TRIGGER log_patient_access_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.patients
  FOR EACH ROW
  EXECUTE FUNCTION public.log_patient_access();

CREATE TRIGGER log_patient_session_access_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.patient_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.log_patient_access();

-- Drop the existing patient RLS policies
DROP POLICY IF EXISTS "Therapists can manage their own patients" ON public.patients;
DROP POLICY IF EXISTS "Verified healthcare providers can manage assigned patients" ON public.patients;

-- Create enhanced RLS policies for patients table
CREATE POLICY "Verified healthcare providers can manage assigned patients"
ON public.patients
FOR ALL
USING (
  auth.uid() = therapist_id 
  AND public.is_verified_healthcare_provider(auth.uid())
);

-- Create policy for patient sessions with same verification
DROP POLICY IF EXISTS "Therapists can manage sessions for their patients" ON public.patient_sessions;
DROP POLICY IF EXISTS "Verified healthcare providers can manage sessions for assigned patients" ON public.patient_sessions;

CREATE POLICY "Verified healthcare providers can manage sessions for assigned patients"
ON public.patient_sessions
FOR ALL
USING (
  EXISTS (
    SELECT 1 
    FROM public.patients p 
    WHERE p.id = patient_sessions.patient_id 
      AND p.therapist_id = auth.uid()
      AND public.is_verified_healthcare_provider(auth.uid())
  )
);

-- Create view for patient data with access control
CREATE OR REPLACE VIEW public.secure_patient_view AS
SELECT 
  p.id,
  p.patient_id,
  -- Partial name masking for additional privacy
  CASE 
    WHEN public.is_verified_healthcare_provider(auth.uid()) THEN p.first_name
    ELSE LEFT(p.first_name, 1) || '***'
  END as first_name,
  CASE 
    WHEN public.is_verified_healthcare_provider(auth.uid()) THEN p.last_name
    ELSE LEFT(p.last_name, 1) || '***'
  END as last_name,
  CASE 
    WHEN public.is_verified_healthcare_provider(auth.uid()) THEN p.date_of_birth
    ELSE NULL
  END as date_of_birth,
  p.primary_condition,
  p.status,
  p.created_at,
  p.updated_at,
  p.therapist_id
FROM public.patients p
WHERE p.therapist_id = auth.uid()
  AND public.is_verified_healthcare_provider(auth.uid());

-- Grant access to the view
GRANT SELECT ON public.secure_patient_view TO authenticated;