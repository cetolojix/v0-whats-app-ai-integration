-- Add address field to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS address TEXT;

-- Update the updated_at timestamp
UPDATE profiles SET updated_at = NOW() WHERE address IS NULL;
