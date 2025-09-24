-- Fix deployment issues for self-hosted environments
-- This script ensures all required functions and data exist

-- Ensure admin user exists and has proper role
DO $$
BEGIN
    -- Check if any admin user exists
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE role = 'admin') THEN
        -- Create a default admin user if none exists
        -- You should change this email and password after deployment
        INSERT INTO auth.users (
            id,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            raw_app_meta_data,
            raw_user_meta_data,
            is_super_admin,
            role
        ) VALUES (
            gen_random_uuid(),
            'admin@example.com',
            crypt('admin123', gen_salt('bf')),
            NOW(),
            NOW(),
            NOW(),
            '{"provider": "email", "providers": ["email"]}',
            '{}',
            false,
            'authenticated'
        ) ON CONFLICT (email) DO NOTHING;

        -- Create profile for admin user
        INSERT INTO profiles (id, email, full_name, role, created_at, updated_at)
        SELECT 
            id,
            email,
            'System Administrator',
            'admin',
            NOW(),
            NOW()
        FROM auth.users 
        WHERE email = 'admin@example.com'
        ON CONFLICT (id) DO UPDATE SET role = 'admin';
    END IF;
END $$;

-- Ensure check_instance_limit function exists and works properly
CREATE OR REPLACE FUNCTION check_instance_limit(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
    current_count INTEGER := 0;
    max_allowed INTEGER := 1;
    package_info RECORD;
    result JSON;
BEGIN
    -- Get current instance count for user (handle null cases)
    SELECT COALESCE(COUNT(*), 0) INTO current_count
    FROM instances
    WHERE user_id = user_uuid AND (status IS NULL OR status != 'deleted');

    -- Get user's package info (or assign basic if none)
    SELECT 
        p.name,
        p.display_name_tr,
        p.display_name_en,
        p.max_instances
    INTO package_info
    FROM user_packages up
    JOIN packages p ON up.package_id = p.id
    WHERE up.user_id = user_uuid AND up.is_active = true
    ORDER BY up.created_at DESC
    LIMIT 1;

    -- If no package found, assign basic package
    IF package_info IS NULL THEN
        -- Ensure basic package exists
        INSERT INTO packages (name, display_name_tr, display_name_en, max_instances, price_monthly, price_yearly, features)
        VALUES ('basic', 'Temel', 'Basic', 1, 0, 0, '[\"1 WhatsApp Instance\", \"Basic Support\"]'::jsonb)
        ON CONFLICT (name) DO NOTHING;

        -- Insert basic package for user
        INSERT INTO user_packages (user_id, package_id, is_active)
        SELECT user_uuid, id, true
        FROM packages
        WHERE name = 'basic'
        ON CONFLICT (user_id, package_id) DO UPDATE SET is_active = true;

        -- Get basic package info
        SELECT 
            name,
            display_name_tr,
            display_name_en,
            max_instances
        INTO package_info
        FROM packages
        WHERE name = 'basic';
    END IF;

    -- Ensure we have valid package info
    IF package_info IS NULL THEN
        package_info := ROW('basic', 'Temel', 'Basic', 1);
    END IF;

    max_allowed := COALESCE(package_info.max_instances, 1);

    -- Build result JSON
    result := json_build_object(
        'can_create', current_count < max_allowed,
        'current_instances', current_count,
        'max_instances', max_allowed,
        'package_name', COALESCE(package_info.name, 'basic'),
        'package_display_tr', COALESCE(package_info.display_name_tr, 'Temel'),
        'package_display_en', COALESCE(package_info.display_name_en, 'Basic')
    );

    RETURN result;
EXCEPTION
    WHEN OTHERS THEN
        -- Return safe defaults if anything fails
        RETURN json_build_object(
            'can_create', true,
            'current_instances', 0,
            'max_instances', 1,
            'package_name', 'basic',
            'package_display_tr', 'Temel',
            'package_display_en', 'Basic'
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a simple function to check if user is admin (for RLS)
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Return true if user has admin role, false otherwise
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = COALESCE(user_id, auth.uid()) AND role = 'admin'
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.is_admin TO authenticated;
GRANT EXECUTE ON FUNCTION check_instance_limit TO authenticated;

-- Ensure RLS policies are correct and don't cause recursion
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Create safe RLS policies
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE USING (public.is_admin());

-- Ensure instances table has proper policies
DROP POLICY IF EXISTS "Users can view their own instances" ON instances;
DROP POLICY IF EXISTS "Users can create their own instances" ON instances;
DROP POLICY IF EXISTS "Admins can view all instances" ON instances;

CREATE POLICY "Users can view their own instances" ON instances
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own instances" ON instances
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own instances" ON instances
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all instances" ON instances
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can update all instances" ON instances
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can delete all instances" ON instances
  FOR DELETE USING (public.is_admin());
