
-- Add Total-Invested column to knyt_personas table
ALTER TABLE public.knyt_personas 
ADD COLUMN "Total-Invested" text DEFAULT ''::text;
