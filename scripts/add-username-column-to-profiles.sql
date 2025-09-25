-- Add username column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username TEXT;

-- Create unique index for username to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_unique ON profiles(username);

-- Add comment to explain the column
COMMENT ON COLUMN profiles.username IS 'Unique username for login authentication';
