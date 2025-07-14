-- Fix registration issue by preventing duplicate persona creation
-- Update handle_new_user_personas to only create personas for users without valid invitations

CREATE OR REPLACE FUNCTION public.handle_new_user_personas()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  invitation_exists BOOLEAN;
BEGIN
  -- Check if user has a valid invitation that will create personas
  SELECT EXISTS(
    SELECT 1 
    FROM public.invited_users 
    WHERE email = NEW.email 
      AND NOT signup_completed 
      AND expires_at > now()
  ) INTO invitation_exists;
  
  -- Only create default personas if no invitation exists
  IF NOT invitation_exists THEN
    -- Insert KNYT persona with empty default values
    INSERT INTO public.knyt_personas (
      user_id,
      "Email"
    ) VALUES (
      NEW.id,
      COALESCE(NEW.email, '')
    );
    
    -- Insert Qrypto persona with empty default values  
    INSERT INTO public.qrypto_personas (
      user_id,
      "Email"
    ) VALUES (
      NEW.id,
      COALESCE(NEW.email, '')
    );
  END IF;
  
  RETURN NEW;
END;
$$;