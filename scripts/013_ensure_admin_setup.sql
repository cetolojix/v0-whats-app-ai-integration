-- Ensure admin user and proper setup for deployment
-- This script creates a default admin user and ensures all required functions exist

-- Create admin user if none exists
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Check if any admin user exists
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE role = 'admin') THEN
        -- Create admin user in auth.users
        INSERT INTO auth.users (
            id,
            instance_id,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            raw_app_meta_data,
            raw_user_meta_data,
            is_super_admin,
            role,
            aud,
            confirmation_token,
            email_change_token_new,
            recovery_token
        ) VALUES (
            gen_random_uuid(),
            '00000000-0000-0000-0000-000000000000',
            'admin@example.com',
            crypt('admin123', gen_salt('bf')),
            NOW(),
            NOW(),
            NOW(),
            '{"provider": "email", "providers": ["email"]}',
            '{}',
            false,
            'authenticated',
            'authenticated',
            '',
            '',
            ''
        ) ON CONFLICT (email) DO NOTHING
        RETURNING id INTO admin_user_id;

        -- Get the admin user ID if it already existed
        IF admin_user_id IS NULL THEN
            SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin@example.com';
        END IF;

        -- Create or update profile for admin user
        INSERT INTO profiles (id, email, full_name, role, created_at, updated_at)
        VALUES (
            admin_user_id,
            'admin@example.com',
            'System Administrator',
            'admin',
            NOW(),
            NOW()
        ) ON CONFLICT (id) DO UPDATE SET 
            role = 'admin',
            updated_at = NOW();

        RAISE NOTICE 'Admin user created: admin@example.com / admin123';
    ELSE
        RAISE NOTICE 'Admin user already exists';
    END IF;
END $$;

-- Ensure all required tables exist
CREATE TABLE IF NOT EXISTS packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    display_name_tr TEXT NOT NULL,
    display_name_en TEXT NOT NULL,
    max_instances INTEGER NOT NULL DEFAULT 1,
    price_monthly DECIMAL(10,2) DEFAULT 0,
    price_yearly DECIMAL(10,2) DEFAULT 0,
    features JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    package_id UUID NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, package_id)
);

-- Insert default packages
INSERT INTO packages (name, display_name_tr, display_name_en, max_instances, price_monthly, price_yearly, features)
VALUES 
    ('basic', 'Temel', 'Basic', 1, 0, 0, '[\"1 WhatsApp Instance\", \"Basic Support\"]'::jsonb),
    ('premium', 'Premium', 'Premium', 5, 29.99, 299.99, '[\"5 WhatsApp Instances\", \"Priority Support\", \"Advanced Features\"]'::jsonb),
    ('pro', 'Profesyonel', 'Professional', 20, 99.99, 999.99, '[\"20 WhatsApp Instances\", \"24/7 Support\", \"All Features\", \"API Access\"]'::jsonb)
ON CONFLICT (name) DO NOTHING;

-- Enable RLS
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_packages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Packages are viewable by everyone" ON packages;
CREATE POLICY "Packages are viewable by everyone" ON packages FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can view their own packages" ON user_packages;
CREATE POLICY "Users can view their own packages" ON user_packages FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own packages" ON user_packages;
CREATE POLICY "Users can insert their own packages" ON user_packages FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Ensure admin view exists
CREATE OR REPLACE VIEW admin_instances_view AS
SELECT 
  i.*,
  p.email as user_email,
  p.full_name as user_full_name,
  p.role as user_role
FROM public.instances i
LEFT JOIN public.profiles p ON i.user_id = p.id;

GRANT SELECT ON admin_instances_view TO authenticated;
