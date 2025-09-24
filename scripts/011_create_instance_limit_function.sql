-- Create a simple instance limit check function
-- This is a minimal version to fix the immediate error

-- Create packages table if it doesn't exist
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

-- Create user_packages table if it doesn't exist
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

-- Insert default packages if they don't exist
INSERT INTO packages (name, display_name_tr, display_name_en, max_instances, price_monthly, price_yearly, features)
VALUES 
    ('basic', 'Temel', 'Basic', 1, 0, 0, '["1 WhatsApp Instance", "Basic Support"]'::jsonb),
    ('premium', 'Premium', 'Premium', 5, 29.99, 299.99, '["5 WhatsApp Instances", "Priority Support", "Advanced Features"]'::jsonb),
    ('pro', 'Profesyonel', 'Professional', 20, 99.99, 999.99, '["20 WhatsApp Instances", "24/7 Support", "All Features", "API Access"]'::jsonb)
ON CONFLICT (name) DO NOTHING;

-- Create the instance limit check function
CREATE OR REPLACE FUNCTION check_instance_limit(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
    current_count INTEGER;
    max_allowed INTEGER;
    package_info RECORD;
    result JSON;
BEGIN
    -- Get current instance count for user
    SELECT COUNT(*) INTO current_count
    FROM instances
    WHERE user_id = user_uuid AND status != 'deleted';

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
        -- Insert basic package for user
        INSERT INTO user_packages (user_id, package_id, is_active)
        SELECT user_uuid, id, true
        FROM packages
        WHERE name = 'basic'
        ON CONFLICT (user_id, package_id) DO NOTHING;

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

    max_allowed := package_info.max_instances;

    -- Build result JSON
    result := json_build_object(
        'can_create', current_count < max_allowed,
        'current_instances', current_count,
        'max_instances', max_allowed,
        'package_name', package_info.name,
        'package_display_tr', package_info.display_name_tr,
        'package_display_en', package_info.display_name_en
    );

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on new tables
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_packages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Packages are viewable by everyone" ON packages FOR SELECT USING (true);

CREATE POLICY "Users can view their own packages" ON user_packages FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own packages" ON user_packages FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own packages" ON user_packages FOR UPDATE 
USING (auth.uid() = user_id);
