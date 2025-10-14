-- Add 'rheumatology' to the condition_category enum type
-- This needs to be in a separate transaction from using the value
ALTER TYPE condition_category ADD VALUE IF NOT EXISTS 'rheumatology';