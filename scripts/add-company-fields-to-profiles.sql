-- Adding company information fields to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS company_title TEXT,
ADD COLUMN IF NOT EXISTS company_address TEXT,
ADD COLUMN IF NOT EXISTS company_tax_number TEXT,
ADD COLUMN IF NOT EXISTS company_website TEXT;

-- Add comment to document the new fields
COMMENT ON COLUMN profiles.company_name IS 'Company name of the user';
COMMENT ON COLUMN profiles.company_title IS 'Job title of the user in the company';
COMMENT ON COLUMN profiles.company_address IS 'Company address';
COMMENT ON COLUMN profiles.company_tax_number IS 'Company tax identification number';
COMMENT ON COLUMN profiles.company_website IS 'Company website URL';

-- Verify the changes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;
