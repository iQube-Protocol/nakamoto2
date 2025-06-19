
-- Enable Row Level Security on invited_users table
ALTER TABLE public.invited_users ENABLE ROW LEVEL SECURITY;

-- Create a security definer function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if the current user's email contains 'admin' or 'nakamoto'
  RETURN (
    SELECT CASE 
      WHEN auth.jwt() ->> 'email' LIKE '%admin%' OR auth.jwt() ->> 'email' LIKE '%nakamoto%' 
      THEN true 
      ELSE false 
    END
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Allow admin users to view all invitations
CREATE POLICY "Admins can view all invitations" 
  ON public.invited_users 
  FOR SELECT 
  USING (public.is_admin_user());

-- Allow admin users to create invitations
CREATE POLICY "Admins can create invitations" 
  ON public.invited_users 
  FOR INSERT 
  WITH CHECK (public.is_admin_user());

-- Allow admin users to update invitations
CREATE POLICY "Admins can update invitations" 
  ON public.invited_users 
  FOR UPDATE 
  USING (public.is_admin_user());

-- Allow admin users to delete invitations
CREATE POLICY "Admins can delete invitations" 
  ON public.invited_users 
  FOR DELETE 
  USING (public.is_admin_user());

-- Also allow the signup process to mark invitations as completed
CREATE POLICY "Allow signup completion" 
  ON public.invited_users 
  FOR UPDATE 
  USING (email = auth.jwt() ->> 'email' AND NOT signup_completed);
