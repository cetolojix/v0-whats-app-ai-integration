-- Create the first admin user (you'll need to sign up first, then run this)
-- Replace 'your-email@example.com' with your actual email
-- This script should be run after you create your first user account

-- Update the first user to be an admin
-- You'll need to replace the email with your actual admin email
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'admin@example.com';

-- If no profile exists yet, you can create one manually:
-- INSERT INTO public.profiles (id, email, full_name, role)
-- SELECT id, email, '', 'admin'
-- FROM auth.users 
-- WHERE email = 'admin@example.com'
-- ON CONFLICT (id) DO UPDATE SET role = 'admin';
