-- Extend all expired invitations by 30 days from now
UPDATE public.invited_users 
SET expires_at = now() + interval '30 days'
WHERE expires_at < now();

-- Fix Hugh Stiel's duplicated last name in persona_data
UPDATE public.invited_users 
SET persona_data = jsonb_set(
  persona_data, 
  '{Last-Name}', 
  '"Stiel"'
)
WHERE email = 'hugh@spiraledge.com' 
  AND persona_data->>'Last-Name' = 'Stiel Stiel';

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

-- Create function to get invitation statistics including expiration status
CREATE OR REPLACE FUNCTION public.get_invitation_expiration_stats()
RETURNS TABLE(
  total_active integer,
  total_expired integer,
  expiring_soon_7_days integer,
  expiring_soon_3_days integer,
  expiring_today integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*)::integer FROM public.invited_users WHERE expires_at > now() AND NOT signup_completed) as total_active,
    (SELECT COUNT(*)::integer FROM public.invited_users WHERE expires_at <= now() AND NOT signup_completed) as total_expired,
    (SELECT COUNT(*)::integer FROM public.invited_users WHERE expires_at > now() AND expires_at <= now() + interval '7 days' AND NOT signup_completed) as expiring_soon_7_days,
    (SELECT COUNT(*)::integer FROM public.invited_users WHERE expires_at > now() AND expires_at <= now() + interval '3 days' AND NOT signup_completed) as expiring_soon_3_days,
    (SELECT COUNT(*)::integer FROM public.invited_users WHERE expires_at > now() AND expires_at <= now() + interval '1 day' AND NOT signup_completed) as expiring_today;
END;
$function$