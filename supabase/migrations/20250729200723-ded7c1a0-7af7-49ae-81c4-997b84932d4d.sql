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