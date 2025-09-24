-- Fix foreign key relationships and ensure admin can see all instances
-- This script addresses the foreign key relationship issues

-- First, ensure the instances table has proper foreign key constraints
ALTER TABLE public.instances 
DROP CONSTRAINT IF EXISTS instances_user_id_fkey;

-- Re-add the foreign key constraint with proper cascade
ALTER TABLE public.instances 
ADD CONSTRAINT instances_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Ensure RLS policies are correct for admin access
DROP POLICY IF EXISTS "Admins can view all instances" ON public.instances;
DROP POLICY IF EXISTS "Admins can update all instances" ON public.instances;
DROP POLICY IF EXISTS "Admins can delete all instances" ON public.instances;

-- Create comprehensive admin policies
CREATE POLICY "Admins can view all instances" ON public.instances
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all instances" ON public.instances
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete all instances" ON public.instances
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create a view for admin to easily access instance data with user info
CREATE OR REPLACE VIEW admin_instances_view AS
SELECT 
  i.*,
  p.email as user_email,
  p.full_name as user_full_name,
  p.role as user_role
FROM public.instances i
LEFT JOIN public.profiles p ON i.user_id = p.id;

-- Grant access to admin view
GRANT SELECT ON admin_instances_view TO authenticated;

-- Create RLS policy for the view
ALTER VIEW admin_instances_view OWNER TO postgres;

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update instances table to include more metadata
ALTER TABLE public.instances 
ADD COLUMN IF NOT EXISTS last_connected_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS connection_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_error TEXT;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_instances_user_id ON public.instances(user_id);
CREATE INDEX IF NOT EXISTS idx_instances_status ON public.instances(status);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Update existing instances to have proper metadata
UPDATE public.instances 
SET 
  last_connected_at = CASE 
    WHEN status = 'open' THEN updated_at 
    ELSE NULL 
  END,
  connection_count = 1
WHERE last_connected_at IS NULL;
