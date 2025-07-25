-- Add security configuration table for future monitoring
CREATE TABLE IF NOT EXISTS public.security_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  event_type TEXT NOT NULL,
  event_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on security events
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- Admins can view all security events
CREATE POLICY "Admins can view all security events" 
ON public.security_events 
FOR SELECT 
USING (is_admin_user());

-- System can insert security events
CREATE POLICY "System can insert security events" 
ON public.security_events 
FOR INSERT 
WITH CHECK (true);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON public.security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_type_created ON public.security_events(event_type, created_at);

-- Add updated_at trigger
CREATE TRIGGER update_security_events_updated_at
  BEFORE UPDATE ON public.security_events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();