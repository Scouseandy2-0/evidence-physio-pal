-- Fix trigger function for subscription analytics

-- Drop the problematic trigger and function
DROP TRIGGER IF EXISTS update_analytics_on_subscriber_change ON subscribers;
DROP FUNCTION IF EXISTS update_subscription_analytics();

-- Create the analytics update function without trigger
CREATE OR REPLACE FUNCTION update_subscription_analytics()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  today_date DATE := CURRENT_DATE;
  new_subs INTEGER;
  cancelled_subs INTEGER;
  trial_conv INTEGER;
  current_mrr INTEGER;
  total_active INTEGER;
  free_count INTEGER;
  basic_count INTEGER;
  professional_count INTEGER;
  enterprise_count INTEGER;
BEGIN
  -- Count new subscribers today
  SELECT COUNT(*) INTO new_subs
  FROM subscribers 
  WHERE DATE(created_at) = today_date;
  
  -- Count cancelled subscribers today (subscription_end set to today)
  SELECT COUNT(*) INTO cancelled_subs
  FROM subscribers 
  WHERE DATE(subscription_end) = today_date AND subscribed = false;
  
  -- Count trial conversions today
  SELECT COUNT(*) INTO trial_conv
  FROM subscribers 
  WHERE DATE(updated_at) = today_date 
    AND subscribed = true 
    AND is_trial = false
    AND trial_end IS NOT NULL;
  
  -- Calculate current MRR (assuming £3.99 = 399 pence for basic tier)
  SELECT COALESCE(SUM(
    CASE 
      WHEN tier = 'basic' THEN 399
      WHEN tier = 'professional' THEN 999
      WHEN tier = 'enterprise' THEN 1999
      ELSE 0
    END
  ), 0) INTO current_mrr
  FROM subscribers 
  WHERE subscribed = true AND is_trial = false;
  
  -- Count total active subscribers
  SELECT COUNT(*) INTO total_active
  FROM subscribers 
  WHERE subscribed = true;
  
  -- Count by tier
  SELECT COUNT(*) INTO free_count FROM subscribers WHERE tier = 'free';
  SELECT COUNT(*) INTO basic_count FROM subscribers WHERE tier = 'basic';
  SELECT COUNT(*) INTO professional_count FROM subscribers WHERE tier = 'professional';
  SELECT COUNT(*) INTO enterprise_count FROM subscribers WHERE tier = 'enterprise';
  
  -- Insert or update analytics
  INSERT INTO subscription_analytics (
    date, new_subscribers, cancelled_subscribers, trial_conversions,
    mrr_cents, total_active_subscribers, free_users, basic_users,
    professional_users, enterprise_users
  ) VALUES (
    today_date, new_subs, cancelled_subs, trial_conv,
    current_mrr, total_active, free_count, basic_count,
    professional_count, enterprise_count
  )
  ON CONFLICT (date) 
  DO UPDATE SET
    new_subscribers = EXCLUDED.new_subscribers,
    cancelled_subscribers = EXCLUDED.cancelled_subscribers,
    trial_conversions = EXCLUDED.trial_conversions,
    mrr_cents = EXCLUDED.mrr_cents,
    total_active_subscribers = EXCLUDED.total_active_subscribers,
    free_users = EXCLUDED.free_users,
    basic_users = EXCLUDED.basic_users,
    professional_users = EXCLUDED.professional_users,
    enterprise_users = EXCLUDED.enterprise_users,
    updated_at = now();
END;
$$;