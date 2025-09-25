-- Create basic package if it doesn't exist
INSERT INTO packages (id, name, display_name, price, features, limits, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'basic',
  'Basic Package',
  0,
  '["Basic WhatsApp Integration", "Simple AI Responses", "1 Instance", "100 Messages/Day"]'::jsonb,
  '{"messages_per_day": 100, "instances": 1, "ai_responses": true}'::jsonb,
  NOW(),
  NOW()
)
ON CONFLICT (name) DO UPDATE SET
  display_name = 'Basic Package',
  features = '["Basic WhatsApp Integration", "Simple AI Responses", "1 Instance", "100 Messages/Day"]'::jsonb,
  limits = '{"messages_per_day": 100, "instances": 1, "ai_responses": true}'::jsonb,
  updated_at = NOW();

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

-- Create user subscription for admin (assign basic package)
INSERT INTO user_subscriptions (id, user_id, package_id, status, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  p.id,
  pkg.id,
  'active',
  NOW(),
  NOW()
FROM profiles p
CROSS JOIN packages pkg
WHERE p.email = 'admin@whatsapp-ai.com' 
  AND pkg.name = 'basic'
ON CONFLICT (user_id, package_id) DO UPDATE SET
  status = 'active',
  updated_at = NOW();

-- Note: This creates a profile record and assigns basic package. 
-- The actual auth user needs to be created through Supabase Auth
-- You can use the "Admin Hesabı Oluştur" button on the login page
-- or sign up with admin@whatsapp-ai.com and this profile will be linked
