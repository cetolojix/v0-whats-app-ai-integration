-- Ensure admin user exists and has admin role
INSERT INTO public.profiles (id, email, full_name, role, created_at, updated_at)
SELECT 
  auth.uid(),
  'admin@whatsapp-ai.com',
  'System Administrator',
  'admin',
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles WHERE email = 'admin@whatsapp-ai.com'
);

-- Update existing admin user to ensure admin role
UPDATE public.profiles 
SET role = 'admin', updated_at = NOW()
WHERE email = 'admin@whatsapp-ai.com';

-- Check if admin user exists in auth.users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'admin@whatsapp-ai.com'
  ) THEN
    RAISE NOTICE 'Admin user does not exist in auth.users. Please create it first.';
  ELSE
    RAISE NOTICE 'Admin user exists in auth.users.';
  END IF;
END $$;
