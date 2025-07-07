
-- Add the missing Wallets-of-Interest column to knyt_personas table
ALTER TABLE public.knyt_personas 
ADD COLUMN IF NOT EXISTS "Wallets-of-Interest" text[] DEFAULT '{}';
