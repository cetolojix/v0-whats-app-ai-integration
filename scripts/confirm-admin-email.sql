-- Confirm the admin user's email manually
-- This script will mark the admin email as confirmed in Supabase

UPDATE auth.users 
SET email_confirmed_at = NOW(), 
    confirmed_at = NOW()
WHERE email = 'admin@whatsapp-ai.com';

-- Also ensure the profile exists
INSERT INTO public.profiles (id, email, role, created_at, updated_at)
SELECT 
    id,
    'admin@whatsapp-ai.com',
    'admin',
    NOW(),
    NOW()
FROM auth.users 
WHERE email = 'admin@whatsapp-ai.com'
ON CONFLICT (id) DO UPDATE SET
    role = 'admin',
    updated_at = NOW();
