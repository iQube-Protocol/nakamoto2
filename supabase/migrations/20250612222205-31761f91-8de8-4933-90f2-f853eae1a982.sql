
-- Add new fields to the blak_qubes table
ALTER TABLE public.blak_qubes 
ADD COLUMN "Qrypto-ID" text DEFAULT ''::text,
ADD COLUMN "ThirdWeb-Public-Key" text DEFAULT ''::text,
ADD COLUMN "YouTube-ID" text DEFAULT ''::text,
ADD COLUMN "Facebook-ID" text DEFAULT ''::text,
ADD COLUMN "TikTok-Handle" text DEFAULT ''::text;
