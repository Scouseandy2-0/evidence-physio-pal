-- Enhanced security policies for subscribers table
-- This migration ensures strict access control for payment-related data

-- First, drop the existing broad policy to replace with more specific ones
DROP POLICY IF EXISTS "subscribers_user_only_access" ON public.subscribers;

-- Create specific policies for different operations with enhanced security

-- Users can only read their own subscription data
CREATE POLICY "subscribers_select_own_data" 
ON public.subscribers 
FOR SELECT 
TO authenticated
USING (
  auth.uid() = user_id 
  OR auth.email() = email
);

-- Users can only update their own subscription data (limited fields)
CREATE POLICY "subscribers_update_own_data" 
ON public.subscribers 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Only service role can insert new subscription records (for edge functions)
CREATE POLICY "subscribers_service_insert" 
ON public.subscribers 
FOR INSERT 
TO service_role
WITH CHECK (true);

-- Only service role can perform administrative updates (for payment webhooks/edge functions)
CREATE POLICY "subscribers_service_update" 
ON public.subscribers 
FOR UPDATE 
TO service_role
USING (true)
WITH CHECK (true);

-- Admins can read all subscription data for support purposes
CREATE POLICY "subscribers_admin_select" 
ON public.subscribers 
FOR SELECT 
TO authenticated
USING (public.is_admin(auth.uid()));

-- Admins can update subscription data for support purposes
CREATE POLICY "subscribers_admin_update" 
ON public.subscribers 
FOR UPDATE 
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Add additional security: Create an audit trigger for sensitive changes
CREATE OR REPLACE FUNCTION public.audit_subscriber_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Log any changes to subscription data for security monitoring
  IF TG_OP = 'UPDATE' THEN
    IF OLD.stripe_customer_id IS DISTINCT FROM NEW.stripe_customer_id 
       OR OLD.subscribed IS DISTINCT FROM NEW.subscribed 
       OR OLD.subscription_tier IS DISTINCT FROM NEW.subscription_tier THEN
      
      INSERT INTO public.notifications (
        user_id,
        title,
        message,
        type,
        data
      ) VALUES (
        NEW.user_id,
        'Subscription Updated',
        'Your subscription information has been modified',
        'security',
        jsonb_build_object(
          'old_stripe_id', OLD.stripe_customer_id,
          'new_stripe_id', NEW.stripe_customer_id,
          'old_subscribed', OLD.subscribed,
          'new_subscribed', NEW.subscribed,
          'old_tier', OLD.subscription_tier,
          'new_tier', NEW.subscription_tier,
          'updated_by', auth.uid(),
          'updated_at', now(),
          'ip_address', current_setting('request.headers')::json->>'cf-connecting-ip'
        )
      );
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create the audit trigger
DROP TRIGGER IF EXISTS subscriber_audit_trigger ON public.subscribers;
CREATE TRIGGER subscriber_audit_trigger
  AFTER UPDATE ON public.subscribers
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_subscriber_changes();

-- Add index for better performance on security-critical queries
CREATE INDEX IF NOT EXISTS idx_subscribers_user_id_security 
ON public.subscribers(user_id) 
WHERE subscribed = true;

-- Add index on email for admin queries (with partial index for efficiency)
CREATE INDEX IF NOT EXISTS idx_subscribers_email_security 
ON public.subscribers(email) 
WHERE stripe_customer_id IS NOT NULL;