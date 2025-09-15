-- Fix security vulnerability: Restrict access to invited_users table
-- Drop the overly permissive policy that allows anyone to read all invitation data
DROP POLICY IF EXISTS "Anyone can read valid invitations" ON public.invited_users;

-- Create a secure policy that only allows access via invitation token
-- This prevents bulk data harvesting while allowing legitimate invitation access
CREATE POLICY "Allow access via invitation token only" 
ON public.invited_users 
FOR SELECT 
USING (
  -- Allow access only if the invitation token is explicitly provided in a secure context
  -- This requires the application to use the invitation_token for access
  (NOT signup_completed) 
  AND (expires_at > now())
  AND (
    -- Allow authenticated users to see their own invitations
    (auth.uid() IS NOT NULL AND email = (auth.jwt() ->> 'email'))
    -- Note: Token-based access will need to be handled at the application level
    -- with RPC functions that verify the token before returning data
  )
);

-- Create a secure RPC function to access invitation by token
-- This prevents direct table access and adds an additional security layer
CREATE OR REPLACE FUNCTION public.get_invitation_by_token(token_value text)
RETURNS TABLE(
  id uuid,
  email text,
  persona_type text,
  expires_at timestamp with time zone,
  signup_completed boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only return basic invitation info, not sensitive persona_data
  RETURN QUERY
  SELECT 
    iu.id,
    iu.email,
    iu.persona_type,
    iu.expires_at,
    iu.signup_completed
  FROM public.invited_users iu
  WHERE iu.invitation_token = token_value
    AND NOT iu.signup_completed
    AND iu.expires_at > now()
  LIMIT 1;
END;
$$;