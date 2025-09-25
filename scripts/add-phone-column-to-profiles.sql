-- Add phone column to profiles table for phone-based authentication
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;

-- Create index for faster phone number lookups
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone);

-- Add constraint to ensure phone numbers are unique
ALTER TABLE profiles ADD CONSTRAINT unique_phone UNIQUE (phone);
