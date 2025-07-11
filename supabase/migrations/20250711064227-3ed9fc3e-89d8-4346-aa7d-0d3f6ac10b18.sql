-- Phase 1: Revert KNYT persona names to invitation data where available
UPDATE public.knyt_personas 
SET 
  "First-Name" = COALESCE(invited_users.persona_data->>'First-Name', knyt_personas."First-Name"),
  "Last-Name" = COALESCE(invited_users.persona_data->>'Last-Name', knyt_personas."Last-Name")
FROM public.invited_users
WHERE knyt_personas."Email" = invited_users.email
  AND invited_users.signup_completed = true
  AND invited_users.persona_type = 'knyt'
  AND (invited_users.persona_data->>'First-Name' IS NOT NULL OR invited_users.persona_data->>'Last-Name' IS NOT NULL);

-- Phase 4: Create user_name_preferences table for tracking name choices
CREATE TABLE public.user_name_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  persona_type TEXT NOT NULL CHECK (persona_type IN ('knyt', 'qrypto', 'blak')),
  name_source TEXT NOT NULL CHECK (name_source IN ('invitation', 'linkedin', 'custom')),
  custom_first_name TEXT,
  custom_last_name TEXT,
  linkedin_first_name TEXT,
  linkedin_last_name TEXT,
  invitation_first_name TEXT,
  invitation_last_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, persona_type)
);

-- Enable RLS
ALTER TABLE public.user_name_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own name preferences" 
ON public.user_name_preferences 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own name preferences" 
ON public.user_name_preferences 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own name preferences" 
ON public.user_name_preferences 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own name preferences" 
ON public.user_name_preferences 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_name_preferences_updated_at
BEFORE UPDATE ON public.user_name_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();