
-- Create the increment_send_attempts function that the edge function is trying to call
CREATE OR REPLACE FUNCTION public.increment_send_attempts(target_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.invited_users 
  SET send_attempts = send_attempts + 1
  WHERE email = target_email;
END;
$$;
