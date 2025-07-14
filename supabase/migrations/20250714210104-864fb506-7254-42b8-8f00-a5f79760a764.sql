-- Fix registration race condition by simplifying invitation check
-- Update handle_new_user_personas to only check if ANY invitation exists for the email

CREATE OR REPLACE FUNCTION public.handle_new_user_personas()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  invitation_exists BOOLEAN;
BEGIN
  -- Check if user has ANY invitation record (regardless of status)
  -- This eliminates race condition with handle_invited_user_signup
  SELECT EXISTS(
    SELECT 1 
    FROM public.invited_users 
    WHERE email = NEW.email 
  ) INTO invitation_exists;
  
  -- Only create default personas if no invitation record exists at all
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