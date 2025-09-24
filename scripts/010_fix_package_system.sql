-- Fix package system and ensure user_package_info view is accessible

-- First, ensure the packages table exists
CREATE TABLE IF NOT EXISTS public.packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_name_tr TEXT NOT NULL,
  display_name_en TEXT NOT NULL,
  max_instances INTEGER NOT NULL,
  price_monthly DECIMAL(10,2),
  price_yearly DECIMAL(10,2),
  features JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure user_subscriptions table exists
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  package_id UUID NOT NULL REFERENCES public.packages(id) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled', 'pending')),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  auto_renew BOOLEAN DEFAULT true,
  payment_method TEXT,
  last_payment_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view active packages" ON public.packages;
DROP POLICY IF EXISTS "Admins can manage packages" ON public.packages;
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Users can insert their own subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Admins can manage all subscriptions" ON public.user_subscriptions;

-- Create RLS policies
CREATE POLICY "Anyone can view active packages" ON public.packages
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage packages" ON public.packages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can view their own subscriptions" ON public.user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriptions" ON public.user_subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions" ON public.user_subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all subscriptions" ON public.user_subscriptions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage all subscriptions" ON public.user_subscriptions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Insert default packages
INSERT INTO public.packages (name, display_name_tr, display_name_en, max_instances, price_monthly, price_yearly, features) VALUES
('basic', 'Temel', 'Basic', 1, 0.00, 0.00, '[\"1 WhatsApp Bot\", \"Temel AI Desteği\", \"Standart Destek\"]'::jsonb),
('premium', 'Premium', 'Premium', 3, 29.99, 299.99, '[\"3 WhatsApp Bot\", \"Gelişmiş AI Desteği\", \"Öncelikli Destek\", \"Özel Promptlar\"]'::jsonb),
('pro', 'Profesyonel', 'Professional', 5, 59.99, 599.99, '[\"5 WhatsApp Bot\", \"Tam AI Desteği\", \"7/24 Destek\", \"Özel Entegrasyonlar\", \"API Erişimi\"]'::jsonb)
ON CONFLICT (name) DO UPDATE SET
  display_name_tr = EXCLUDED.display_name_tr,
  display_name_en = EXCLUDED.display_name_en,
  max_instances = EXCLUDED.max_instances,
  price_monthly = EXCLUDED.price_monthly,
  price_yearly = EXCLUDED.price_yearly,
  features = EXCLUDED.features,
  updated_at = NOW();

-- Give all existing users basic package by default
INSERT INTO public.user_subscriptions (user_id, package_id, status, started_at)
SELECT 
  p.id as user_id,
  pkg.id as package_id,
  'active' as status,
  NOW() as started_at
FROM public.profiles p
CROSS JOIN public.packages pkg
WHERE pkg.name = 'basic'
AND NOT EXISTS (
  SELECT 1 FROM public.user_subscriptions us 
  WHERE us.user_id = p.id
);

-- Drop and recreate the view to ensure it's properly accessible
DROP VIEW IF EXISTS public.user_package_info;

CREATE VIEW public.user_package_info AS
SELECT 
  p.id as user_id,
  p.full_name,
  p.email,
  p.role,
  pkg.name as package_name,
  pkg.display_name_tr,
  pkg.display_name_en,
  pkg.max_instances,
  pkg.price_monthly,
  pkg.price_yearly,
  pkg.features,
  us.status as subscription_status,
  us.started_at,
  us.expires_at,
  us.auto_renew,
  -- Count current instances
  COALESCE(inst_count.instance_count, 0) as current_instances,
  -- Calculate remaining instances
  (pkg.max_instances - COALESCE(inst_count.instance_count, 0)) as remaining_instances
FROM public.profiles p
LEFT JOIN public.user_subscriptions us ON p.id = us.user_id AND us.status = 'active'
LEFT JOIN public.packages pkg ON us.package_id = pkg.id
LEFT JOIN (
  SELECT user_id, COUNT(*) as instance_count
  FROM public.instances
  GROUP BY user_id
) inst_count ON p.id = inst_count.user_id
WHERE pkg.is_active = true OR pkg.id IS NULL;

-- Grant permissions on the view
GRANT SELECT ON public.user_package_info TO authenticated;

-- Drop existing view policies
DROP POLICY IF EXISTS "Users can view their own package info" ON public.user_package_info;
DROP POLICY IF EXISTS "Admins can view all package info" ON public.user_package_info;

-- Enable RLS on the view
ALTER VIEW public.user_package_info SET (security_barrier = true);

-- Note: Views don't support RLS policies directly, so we need to ensure the underlying tables have proper RLS
-- The view will inherit the security from the underlying tables

-- Create function to check instance limit
CREATE OR REPLACE FUNCTION public.check_instance_limit(user_uuid UUID)
RETURNS JSONB AS $$
DECLARE
  user_info RECORD;
  result JSONB;
BEGIN
  -- Get user package information
  SELECT * INTO user_info
  FROM public.user_package_info
  WHERE user_id = user_uuid;
  
  IF NOT FOUND THEN
    -- User has no package, assign basic package
    INSERT INTO public.user_subscriptions (user_id, package_id, status)
    SELECT user_uuid, id, 'active'
    FROM public.packages
    WHERE name = 'basic'
    LIMIT 1;
    
    -- Get updated info
    SELECT * INTO user_info
    FROM public.user_package_info
    WHERE user_id = user_uuid;
  END IF;
  
  result := jsonb_build_object(
    'can_create', user_info.remaining_instances > 0,
    'current_instances', user_info.current_instances,
    'max_instances', user_info.max_instances,
    'remaining_instances', user_info.remaining_instances,
    'package_name', user_info.package_name,
    'package_display_tr', user_info.display_name_tr,
    'package_display_en', user_info.display_name_en
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.check_instance_limit(UUID) TO authenticated;
