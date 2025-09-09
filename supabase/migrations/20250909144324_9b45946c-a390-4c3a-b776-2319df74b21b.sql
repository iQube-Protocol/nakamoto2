-- Create function to extend invitation expiration dates safely
CREATE OR REPLACE FUNCTION extend_invitation_expiration(
  invitation_emails text[],
  extend_days integer DEFAULT 30
)
RETURNS TABLE(
  success boolean,
  updated_count integer,
  error_message text
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  update_count integer;
BEGIN
  -- Update expiration dates for the specified emails
  UPDATE invited_users 
  SET expires_at = NOW() + INTERVAL '1 day' * extend_days,
      updated_at = NOW()
  WHERE email = ANY(invitation_emails) 
    AND signup_completed = false;
  
  -- Get the count of updated rows
  GET DIAGNOSTICS update_count = ROW_COUNT;
  
  -- Return success result
  RETURN QUERY SELECT 
    true as success,
    update_count as updated_count,
    ''::text as error_message;
    
EXCEPTION WHEN others THEN
  -- Return error result
  RETURN QUERY SELECT 
    false as success,
    0 as updated_count,
    SQLERRM as error_message;
END;
$$;