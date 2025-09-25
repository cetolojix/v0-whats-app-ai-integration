-- Create admin user in profiles table
INSERT INTO profiles (id, email, full_name, role, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'admin@whatsapp-ai.com',
  'System Administrator',
  'admin',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  role = 'admin',
  updated_at = NOW();

-- Note: This creates a profile record. 
-- The actual auth user needs to be created through Supabase Auth
-- You can sign up with admin@whatsapp-ai.com and this profile will be linked
