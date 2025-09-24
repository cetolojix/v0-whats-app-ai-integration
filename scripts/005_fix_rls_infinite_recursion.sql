-- Fix infinite recursion in RLS policies by removing circular references
-- The issue: admin policies were querying the profiles table from within profiles table policies

-- Drop all existing policies that cause infinite recursion
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all instances" ON public.instances;
DROP POLICY IF EXISTS "Admins can update all instances" ON public.instances;
DROP POLICY IF EXISTS "Admins can delete all instances" ON public.instances;

-- Create a security definer function to check if a user is admin
-- This function runs with elevated privileges and bypasses RLS
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND role = 'admin'
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.is_admin TO authenticated;

-- Create new admin policies using the security definer function
-- These policies use the function which bypasses RLS to avoid recursion

-- Admin policies for profiles table
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can delete profiles" ON public.profiles
  FOR DELETE USING (public.is_admin());

-- Admin policies for instances table  
CREATE POLICY "Admins can view all instances" ON public.instances
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can update all instances" ON public.instances
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can delete all instances" ON public.instances
  FOR DELETE USING (public.is_admin());

-- Add a policy to allow admins to insert instances for any user
CREATE POLICY "Admins can insert instances for any user" ON public.instances
  FOR INSERT WITH CHECK (public.is_admin());
