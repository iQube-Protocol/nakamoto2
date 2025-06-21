
-- Add new columns to the invited_users table for email tracking and batch management
ALTER TABLE public.invited_users 
ADD COLUMN email_sent boolean NOT NULL DEFAULT false,
ADD COLUMN email_sent_at timestamp with time zone,
ADD COLUMN batch_id text,
ADD COLUMN send_attempts integer NOT NULL DEFAULT 0;

-- Create an index on email_sent for better query performance
CREATE INDEX idx_invited_users_email_sent ON public.invited_users(email_sent);

-- Create an index on batch_id for batch tracking queries
CREATE INDEX idx_invited_users_batch_id ON public.invited_users(batch_id);

-- Create a table to track email sending batches
CREATE TABLE public.email_batches (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_id text NOT NULL UNIQUE,
  total_emails integer NOT NULL,
  emails_sent integer NOT NULL DEFAULT 0,
  emails_failed integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending', -- pending, in_progress, completed, failed
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Create an index on batch_id for the email_batches table
CREATE INDEX idx_email_batches_batch_id ON public.email_batches(batch_id);
CREATE INDEX idx_email_batches_status ON public.email_batches(status);
