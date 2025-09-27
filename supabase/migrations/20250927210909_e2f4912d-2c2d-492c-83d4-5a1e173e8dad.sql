-- Security improvements for existing database structure

-- Add password strength validation function
CREATE OR REPLACE FUNCTION public.check_password_strength(password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check minimum length (8 characters)
  IF length(password) < 8 THEN
    RAISE EXCEPTION 'Password must be at least 8 characters long';
  END IF;
  
  -- Check for basic complexity
  IF password !~ '[A-Z]' THEN
    RAISE EXCEPTION 'Password must contain at least one uppercase letter';
  END IF;
  
  IF password !~ '[a-z]' THEN
    RAISE EXCEPTION 'Password must contain at least one lowercase letter';
  END IF;
  
  IF password !~ '[0-9]' THEN
    RAISE EXCEPTION 'Password must contain at least one number';
  END IF;
  
  RETURN true;
END;
$$;

-- Enhanced security audit function
CREATE OR REPLACE FUNCTION public.audit_security_event(
  event_type text,
  user_id uuid DEFAULT auth.uid(),
  details jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (
    user_id,
    title,
    message,
    type,
    data
  ) VALUES (
    user_id,
    'Security Event',
    'Security event recorded: ' || event_type,
    'security',
    jsonb_build_object(
      'event_type', event_type,
      'timestamp', now(),
      'details', details
    )
  );
END;
$$;

-- Add security headers function for edge functions
CREATE OR REPLACE FUNCTION public.get_security_headers()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN jsonb_build_object(
    'X-Content-Type-Options', 'nosniff',
    'X-Frame-Options', 'DENY',
    'X-XSS-Protection', '1; mode=block',
    'Strict-Transport-Security', 'max-age=31536000; includeSubDomains',
    'Content-Security-Policy', 'default-src ''self''; script-src ''self'' ''unsafe-inline''; style-src ''self'' ''unsafe-inline'';'
  );
END;
$$;

-- Add rate limiting function for API protection
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  operation_type text,
  user_id uuid DEFAULT auth.uid(),
  max_attempts integer DEFAULT 5,
  window_minutes integer DEFAULT 60
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  attempt_count integer;
BEGIN
  -- Count recent attempts
  SELECT COUNT(*) INTO attempt_count
  FROM public.notifications
  WHERE user_id = check_rate_limit.user_id
    AND type = 'security'
    AND data->>'event_type' = operation_type
    AND created_at > now() - (window_minutes || ' minutes')::interval;
  
  IF attempt_count >= max_attempts THEN
    -- Log the rate limit violation
    PERFORM public.audit_security_event(
      'rate_limit_exceeded',
      user_id,
      jsonb_build_object(
        'operation', operation_type,
        'attempts', attempt_count,
        'window_minutes', window_minutes
      )
    );
    
    RAISE EXCEPTION 'Rate limit exceeded for operation: %', operation_type;
  END IF;
  
  RETURN true;
END;
$$;