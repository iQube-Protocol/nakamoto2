-- Fix the function by removing updated_at column reference since it doesn't exist
CREATE OR REPLACE FUNCTION extend_invitation_expiration(
  email_list text[] DEFAULT NULL,
  extend_days integer DEFAULT 30
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  update_count integer;
BEGIN
  -- If no email list provided, extend all expired invitations
  IF email_list IS NULL THEN
    UPDATE public.invited_users 
    SET expires_at = now() + (extend_days || ' days')::interval
    WHERE NOT signup_completed 
      AND expires_at <= now();
  ELSE
    UPDATE public.invited_users 
    SET expires_at = now() + (extend_days || ' days')::interval
    WHERE email = ANY(email_list) 
      AND NOT signup_completed;
  END IF;
  
  -- Get the count of updated rows
  GET DIAGNOSTICS update_count = ROW_COUNT;
  
  -- Return as JSON object
  RETURN json_build_object(
    'updated_count', update_count,
    'success', true
  );
END;
$$;