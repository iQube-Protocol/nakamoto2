
-- Create separate tables for KNYT and Qrypto personas

-- Create KNYT Personas table with all KNYT-specific fields
CREATE TABLE public.knyt_personas (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  
  -- Basic Info
  "First-Name" text DEFAULT ''::text,
  "Last-Name" text DEFAULT ''::text,
  "KNYT-ID" text DEFAULT ''::text,
  "Profession" text DEFAULT ''::text,
  "Local-City" text DEFAULT ''::text,
  "Email" text DEFAULT ''::text,
  "Phone-Number" text DEFAULT ''::text,
  "Age" text DEFAULT ''::text,
  "Address" text DEFAULT ''::text,
  
  -- Crypto & Wallet Info
  "EVM-Public-Key" text DEFAULT ''::text,
  "BTC-Public-Key" text DEFAULT ''::text,
  "ThirdWeb-Public-Key" text DEFAULT ''::text,
  "MetaKeep-Public-Key" text DEFAULT ''::text,
  "Chain-IDs" text[] DEFAULT '{}'::text[],
  "Web3-Interests" text[] DEFAULT '{}'::text[],
  "Tokens-of-Interest" text[] DEFAULT '{}'::text[],
  
  -- Social Media
  "LinkedIn-ID" text DEFAULT ''::text,
  "LinkedIn-Profile-URL" text DEFAULT ''::text,
  "Twitter-Handle" text DEFAULT ''::text,
  "Telegram-Handle" text DEFAULT ''::text,
  "Discord-Handle" text DEFAULT ''::text,
  "Instagram-Handle" text DEFAULT ''::text,
  "YouTube-ID" text DEFAULT ''::text,
  "Facebook-ID" text DEFAULT ''::text,
  "TikTok-Handle" text DEFAULT ''::text,
  
  -- KNYT-specific fields
  "OM-Member-Since" text DEFAULT ''::text,
  "OM-Tier-Status" text DEFAULT ''::text,
  "Metaiye-Shares-Owned" text DEFAULT ''::text,
  "KNYT-COYN-Owned" text DEFAULT ''::text,
  "Motion-Comics-Owned" text DEFAULT ''::text,
  "Paper-Comics-Owned" text DEFAULT ''::text,
  "Digital-Comics-Owned" text DEFAULT ''::text,
  "KNYT-Posters-Owned" text DEFAULT ''::text,
  "KNYT-Cards-Owned" text DEFAULT ''::text,
  "Characters-Owned" text DEFAULT ''::text,
  
  UNIQUE(user_id)
);

-- Create Qrypto Personas table with only Qrypto-relevant fields
CREATE TABLE public.qrypto_personas (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  
  -- Basic Info
  "First-Name" text DEFAULT ''::text,
  "Last-Name" text DEFAULT ''::text,
  "Qrypto-ID" text DEFAULT ''::text,
  "Profession" text DEFAULT ''::text,
  "Local-City" text DEFAULT ''::text,
  "Email" text DEFAULT ''::text,
  
  -- Crypto & Wallet Info
  "EVM-Public-Key" text DEFAULT ''::text,
  "BTC-Public-Key" text DEFAULT ''::text,
  "Chain-IDs" text[] DEFAULT '{}'::text[],
  "Wallets-of-Interest" text[] DEFAULT '{}'::text[],
  "Web3-Interests" text[] DEFAULT '{}'::text[],
  "Tokens-of-Interest" text[] DEFAULT '{}'::text[],
  
  -- Social Media
  "LinkedIn-ID" text DEFAULT ''::text,
  "LinkedIn-Profile-URL" text DEFAULT ''::text,
  "Twitter-Handle" text DEFAULT ''::text,
  "Telegram-Handle" text DEFAULT ''::text,
  "Discord-Handle" text DEFAULT ''::text,
  "Instagram-Handle" text DEFAULT ''::text,
  "GitHub-Handle" text DEFAULT ''::text,
  "YouTube-ID" text DEFAULT ''::text,
  "Facebook-ID" text DEFAULT ''::text,
  "TikTok-Handle" text DEFAULT ''::text,
  
  UNIQUE(user_id)
);

-- Enable Row Level Security on both tables
ALTER TABLE public.knyt_personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qrypto_personas ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for KNYT personas
CREATE POLICY "Users can view their own KNYT persona" 
  ON public.knyt_personas 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own KNYT persona" 
  ON public.knyt_personas 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own KNYT persona" 
  ON public.knyt_personas 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own KNYT persona" 
  ON public.knyt_personas 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create RLS policies for Qrypto personas
CREATE POLICY "Users can view their own Qrypto persona" 
  ON public.qrypto_personas 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own Qrypto persona" 
  ON public.qrypto_personas 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own Qrypto persona" 
  ON public.qrypto_personas 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own Qrypto persona" 
  ON public.qrypto_personas 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Migrate existing data from blak_qubes to the new tables
-- Insert into KNYT personas (records with KNYT-ID)
INSERT INTO public.knyt_personas (
  user_id, created_at, updated_at,
  "First-Name", "Last-Name", "KNYT-ID", "Profession", "Local-City", "Email", 
  "Phone-Number", "Age", "Address", "EVM-Public-Key", "BTC-Public-Key", 
  "ThirdWeb-Public-Key", "MetaKeep-Public-Key", "Chain-IDs", "Web3-Interests", 
  "Tokens-of-Interest", "LinkedIn-ID", "LinkedIn-Profile-URL", "Twitter-Handle", 
  "Telegram-Handle", "Discord-Handle", "Instagram-Handle", "YouTube-ID", 
  "Facebook-ID", "TikTok-Handle", "OM-Member-Since", "OM-Tier-Status", 
  "Metaiye-Shares-Owned", "KNYT-COYN-Owned", "Motion-Comics-Owned", 
  "Paper-Comics-Owned", "Digital-Comics-Owned", "KNYT-Posters-Owned", 
  "KNYT-Cards-Owned", "Characters-Owned"
)
SELECT 
  user_id, created_at, updated_at,
  "First-Name", "Last-Name", "KNYT-ID", "Profession", "Local-City", "Email", 
  "Phone-Number", "Age", "Address", "EVM-Public-Key", "BTC-Public-Key", 
  "ThirdWeb-Public-Key", "MetaKeep-Public-Key", "Chain-IDs", "Web3-Interests", 
  "Tokens-of-Interest", "LinkedIn-ID", "LinkedIn-Profile-URL", "Twitter-Handle", 
  "Telegram-Handle", "Discord-Handle", "Instagram-Handle", "YouTube-ID", 
  "Facebook-ID", "TikTok-Handle", "OM-Member-Since", "OM-Tier-Status", 
  "Metaiye-Shares-Owned", "KNYT-COYN-Owned", "Motion-Comics-Owned", 
  "Paper-Comics-Owned", "Digital-Comics-Owned", "KNYT-Posters-Owned", 
  "KNYT-Cards-Owned", "Characters-Owned"
FROM public.blak_qubes 
WHERE "KNYT-ID" IS NOT NULL AND "KNYT-ID" != '';

-- Insert into Qrypto personas (records with Qrypto-ID or neither)
INSERT INTO public.qrypto_personas (
  user_id, created_at, updated_at,
  "First-Name", "Last-Name", "Qrypto-ID", "Profession", "Local-City", "Email", 
  "EVM-Public-Key", "BTC-Public-Key", "Chain-IDs", "Wallets-of-Interest", 
  "Web3-Interests", "Tokens-of-Interest", "LinkedIn-ID", "LinkedIn-Profile-URL", 
  "Twitter-Handle", "Telegram-Handle", "Discord-Handle", "Instagram-Handle", 
  "GitHub-Handle", "YouTube-ID", "Facebook-ID", "TikTok-Handle"
)
SELECT 
  user_id, created_at, updated_at,
  "First-Name", "Last-Name", "Qrypto-ID", "Profession", "Local-City", "Email", 
  "EVM-Public-Key", "BTC-Public-Key", "Chain-IDs", "Wallets-of-Interest", 
  "Web3-Interests", "Tokens-of-Interest", "LinkedIn-ID", "LinkedIn-Profile-URL", 
  "Twitter-Handle", "Telegram-Handle", "Discord-Handle", "Instagram-Handle", 
  "GitHub-Handle", "YouTube-ID", "Facebook-ID", "TikTok-Handle"
FROM public.blak_qubes 
WHERE "KNYT-ID" IS NULL OR "KNYT-ID" = '';

-- Drop the old blak_qubes table (commented out for safety - uncomment after verification)
-- DROP TABLE public.blak_qubes;
