-- Populate evidence table with real data from external sources
-- This will be done through the edge functions

-- First let's add some sample search terms that we'll use for fetching real data
INSERT INTO user_preferences (user_id, preferred_conditions, display_preferences, notification_settings)
VALUES (
  '00000000-0000-0000-0000-000000000000'::uuid,  -- System user for data population
  ARRAY[
    'low back pain',
    'stroke rehabilitation', 
    'knee osteoarthritis',
    'shoulder impingement',
    'COPD',
    'spinal cord injury',
    'balance training',
    'manual therapy',
    'exercise therapy',
    'chronic pain'
  ],
  '{"data_populated": true, "real_data_fetch": true}'::jsonb,
  '{"real_data_sync": true}'::jsonb
) ON CONFLICT (user_id) DO UPDATE SET
  preferred_conditions = EXCLUDED.preferred_conditions,
  display_preferences = display_preferences || EXCLUDED.display_preferences,
  notification_settings = notification_settings || EXCLUDED.notification_settings;