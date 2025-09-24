-- Create instances table to track WhatsApp instances
CREATE TABLE IF NOT EXISTS public.instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  instance_name TEXT NOT NULL,
  instance_key TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'disconnected' CHECK (status IN ('connecting', 'open', 'closed', 'disconnected')),
  qr_code TEXT,
  workflow_id TEXT,
  workflow_name TEXT,
  custom_prompt TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on instances
ALTER TABLE public.instances ENABLE ROW LEVEL SECURITY;

-- RLS policies for instances
CREATE POLICY "Users can view their own instances" ON public.instances
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own instances" ON public.instances
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own instances" ON public.instances
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own instances" ON public.instances
  FOR DELETE USING (auth.uid() = user_id);

-- Admin can view all instances
CREATE POLICY "Admins can view all instances" ON public.instances
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admin can update all instances
CREATE POLICY "Admins can update all instances" ON public.instances
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admin can delete all instances
CREATE POLICY "Admins can delete all instances" ON public.instances
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
