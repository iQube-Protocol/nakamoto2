
-- Add First-Name and Last-Name columns to the blak_qubes table
ALTER TABLE public.blak_qubes 
ADD COLUMN "First-Name" text DEFAULT ''::text,
ADD COLUMN "Last-Name" text DEFAULT ''::text;
