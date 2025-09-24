-- Create audit and activity log tables for admin oversight

-- Instance audit log table
CREATE TABLE IF NOT EXISTS public.instance_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID REFERENCES instances(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  admin_user_id UUID REFERENCES auth.users(id), -- Admin who performed the action
  operation_type TEXT NOT NULL CHECK (operation_type IN ('CREATE', 'UPDATE', 'DELETE', 'STATUS_CHANGE', 'QR_REFRESH')),
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System activity log table
CREATE TABLE IF NOT EXISTS public.system_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  admin_user_id UUID REFERENCES auth.users(id), -- Admin who performed the action
  activity_type TEXT NOT NULL CHECK (activity_type IN ('LOGIN', 'LOGOUT', 'INSTANCE_CREATE', 'INSTANCE_DELETE', 'ROLE_CHANGE', 'USER_DELETE', 'ADMIN_ACTION')),
  resource_type TEXT NOT NULL CHECK (resource_type IN ('instances', 'users', 'profiles', 'system')),
  resource_id UUID,
  description TEXT NOT NULL,
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User sessions table for tracking active sessions
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE,
  ip_address INET,
  user_agent TEXT,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on audit tables
ALTER TABLE public.instance_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- RLS policies for audit logs (only admins can view)
CREATE POLICY "Only admins can view instance audit logs" ON public.instance_audit_log
  FOR SELECT USING (is_admin());

CREATE POLICY "Only admins can view system activity logs" ON public.system_activity_log
  FOR SELECT USING (is_admin());

CREATE POLICY "Users can view their own sessions" ON public.user_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all sessions" ON public.user_sessions
  FOR SELECT USING (is_admin());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_instance_audit_log_instance_id ON public.instance_audit_log(instance_id);
CREATE INDEX IF NOT EXISTS idx_instance_audit_log_user_id ON public.instance_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_instance_audit_log_created_at ON public.instance_audit_log(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_system_activity_log_user_id ON public.system_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_system_activity_log_activity_type ON public.system_activity_log(activity_type);
CREATE INDEX IF NOT EXISTS idx_system_activity_log_created_at ON public.system_activity_log(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_last_activity ON public.user_sessions(last_activity DESC);

-- Function to log instance operations
CREATE OR REPLACE FUNCTION log_instance_operation(
  p_instance_id UUID,
  p_user_id UUID,
  p_admin_user_id UUID DEFAULT NULL,
  p_operation_type TEXT,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.instance_audit_log (
    instance_id, user_id, admin_user_id, operation_type,
    old_values, new_values, description, ip_address, user_agent
  ) VALUES (
    p_instance_id, p_user_id, p_admin_user_id, p_operation_type,
    p_old_values, p_new_values, p_description, p_ip_address, p_user_agent
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;

-- Function to log system activities
CREATE OR REPLACE FUNCTION log_system_activity(
  p_user_id UUID,
  p_admin_user_id UUID DEFAULT NULL,
  p_activity_type TEXT,
  p_resource_type TEXT,
  p_resource_id UUID DEFAULT NULL,
  p_description TEXT,
  p_metadata JSONB DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  activity_id UUID;
BEGIN
  INSERT INTO public.system_activity_log (
    user_id, admin_user_id, activity_type, resource_type,
    resource_id, description, metadata, ip_address, user_agent
  ) VALUES (
    p_user_id, p_admin_user_id, p_activity_type, p_resource_type,
    p_resource_id, p_description, p_metadata, p_ip_address, p_user_agent
  ) RETURNING id INTO activity_id;
  
  RETURN activity_id;
END;
$$;

-- Trigger function to automatically log instance changes
CREATE OR REPLACE FUNCTION trigger_log_instance_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM log_instance_operation(
      NEW.id,
      NEW.user_id,
      NULL,
      'CREATE',
      NULL,
      to_jsonb(NEW),
      'Instance created: ' || NEW.instance_name
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM log_instance_operation(
      NEW.id,
      NEW.user_id,
      NULL,
      CASE 
        WHEN OLD.status != NEW.status THEN 'STATUS_CHANGE'
        ELSE 'UPDATE'
      END,
      to_jsonb(OLD),
      to_jsonb(NEW),
      'Instance updated: ' || NEW.instance_name
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM log_instance_operation(
      OLD.id,
      OLD.user_id,
      NULL,
      'DELETE',
      to_jsonb(OLD),
      NULL,
      'Instance deleted: ' || OLD.instance_name
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Create trigger for automatic instance logging
DROP TRIGGER IF EXISTS trigger_instances_audit ON public.instances;
CREATE TRIGGER trigger_instances_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.instances
  FOR EACH ROW EXECUTE FUNCTION trigger_log_instance_changes();

-- Grant necessary permissions
GRANT SELECT ON public.instance_audit_log TO authenticated;
GRANT SELECT ON public.system_activity_log TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_sessions TO authenticated;
