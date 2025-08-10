-- Enable real-time functionality for invited_users table
ALTER TABLE public.invited_users REPLICA IDENTITY FULL;

-- Add the table to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.invited_users;