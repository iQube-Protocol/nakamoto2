-- Create function to handle new user persona creation
CREATE OR REPLACE FUNCTION public.handle_new_user_personas()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  -- Create both KNYT and Qrypto persona records for new users
  
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
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically create personas for new users
DROP TRIGGER IF EXISTS on_auth_user_created_personas ON auth.users;
CREATE TRIGGER on_auth_user_created_personas
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user_personas();

-- Create personas for existing users who don't have them
DO $$
DECLARE
  user_record RECORD;
BEGIN
  -- Find users who don't have KNYT personas and create them
  FOR user_record IN 
    SELECT au.id, au.email 
    FROM auth.users au
    LEFT JOIN public.knyt_personas kp ON au.id = kp.user_id
    WHERE kp.user_id IS NULL
  LOOP
    INSERT INTO public.knyt_personas (user_id, "Email") 
    VALUES (user_record.id, COALESCE(user_record.email, ''));
  END LOOP;
  
  -- Find users who don't have Qrypto personas and create them
  FOR user_record IN 
    SELECT au.id, au.email 
    FROM auth.users au
    LEFT JOIN public.qrypto_personas qp ON au.id = qp.user_id
    WHERE qp.user_id IS NULL
  LOOP
    INSERT INTO public.qrypto_personas (user_id, "Email") 
    VALUES (user_record.id, COALESCE(user_record.email, ''));
  END LOOP;
END $$;