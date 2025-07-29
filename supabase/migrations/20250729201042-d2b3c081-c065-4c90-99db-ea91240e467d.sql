-- Create function to extend expiration dates in bulk
CREATE OR REPLACE FUNCTION public.extend_invitation_expiration(
  email_list text[] DEFAULT NULL,
  extend_days integer DEFAULT 30
)
RETURNS TABLE(
  updated_count integer,
  emails_updated text[]
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  updated_emails text[];
  update_count integer;
BEGIN
  -- If no email list provided, extend all non-completed invitations
  IF email_list IS NULL THEN
    UPDATE public.invited_users 
    SET expires_at = now() + (extend_days || ' days')::interval
    WHERE NOT signup_completed
    RETURNING email INTO updated_emails;
  ELSE
    UPDATE public.invited_users 
    SET expires_at = now() + (extend_days || ' days')::interval
    WHERE email = ANY(email_list) AND NOT signup_completed
    RETURNING email INTO updated_emails;
  END IF;
  
  GET DIAGNOSTICS update_count = ROW_COUNT;
  
  updated_count := update_count;
  emails_updated := updated_emails;
  
  RETURN NEXT;
END;
$function$