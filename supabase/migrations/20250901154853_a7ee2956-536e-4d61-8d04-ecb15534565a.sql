-- Fix OTP expiry security warning
-- Set OTP expiry to recommended security threshold (10 minutes = 600 seconds)
ALTER DATABASE postgres SET "app.settings.auth_otp_exp" = '600';