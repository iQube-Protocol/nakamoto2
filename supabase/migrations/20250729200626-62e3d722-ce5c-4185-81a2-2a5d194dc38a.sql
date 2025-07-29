-- Create function to get expiring invitations (within specified days)
CREATE OR REPLACE FUNCTION public.get_expiring_invitations(days_ahead integer DEFAULT 7)
RETURNS TABLE(
  email text,
  persona_type text,
  expires_at timestamp with time zone,
  days_until_expiry integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    iu.email,
    iu.persona_type,
    iu.expires_at,
    EXTRACT(days FROM (iu.expires_at - now()))::integer as days_until_expiry
  FROM public.invited_users iu
  WHERE iu.expires_at > now() 
    AND iu.expires_at <= now() + (days_ahead || ' days')::interval
    AND NOT iu.signup_completed
  ORDER BY iu.expires_at ASC;
END;
$function$