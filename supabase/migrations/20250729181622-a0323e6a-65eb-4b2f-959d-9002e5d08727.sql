-- Create RPC function to count direct signups
-- This counts auth.users whose emails don't exist in invited_users table
CREATE OR REPLACE FUNCTION public.count_direct_signups()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  direct_signup_count integer;
BEGIN
  -- Count users in auth.users whose email is not in invited_users
  SELECT COUNT(*)
  INTO direct_signup_count
  FROM auth.users au
  WHERE NOT EXISTS (
    SELECT 1 
    FROM public.invited_users iu 
    WHERE iu.email = au.email
  );
  
  RETURN direct_signup_count;
END;
$function$