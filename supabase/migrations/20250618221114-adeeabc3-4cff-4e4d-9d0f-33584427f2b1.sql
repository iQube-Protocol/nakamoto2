
-- Add KNYT Persona specific fields to the blak_qubes table
ALTER TABLE public.blak_qubes 
ADD COLUMN "KNYT-ID" text DEFAULT ''::text,
ADD COLUMN "Phone-Number" text DEFAULT ''::text,
ADD COLUMN "Age" text DEFAULT ''::text,
ADD COLUMN "Address" text DEFAULT ''::text,
ADD COLUMN "OM-Member-Since" text DEFAULT ''::text,
ADD COLUMN "OM-Tier-Status" text DEFAULT ''::text,
ADD COLUMN "Metaiye-Shares-Owned" text DEFAULT ''::text,
ADD COLUMN "KNYT-COYN-Owned" text DEFAULT ''::text,
ADD COLUMN "MetaKeep-Public-Key" text DEFAULT ''::text,
ADD COLUMN "Motion-Comics-Owned" text DEFAULT ''::text,
ADD COLUMN "Paper-Comics-Owned" text DEFAULT ''::text,
ADD COLUMN "Digital-Comics-Owned" text DEFAULT ''::text,
ADD COLUMN "KNYT-Posters-Owned" text DEFAULT ''::text,
ADD COLUMN "KNYT-Cards-Owned" text DEFAULT ''::text,
ADD COLUMN "Characters-Owned" text DEFAULT ''::text;

-- Create a table to track KNYT Persona rewards
CREATE TABLE public.knyt_persona_rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  linkedin_connected BOOLEAN DEFAULT FALSE,
  metamask_connected BOOLEAN DEFAULT FALSE,
  data_completed BOOLEAN DEFAULT FALSE,
  reward_claimed BOOLEAN DEFAULT FALSE,
  reward_amount INTEGER DEFAULT 2800, -- Satoshi amount
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) to the rewards table
ALTER TABLE public.knyt_persona_rewards ENABLE ROW LEVEL SECURITY;

-- Create policies for the rewards table
CREATE POLICY "Users can view their own KNYT rewards" 
  ON public.knyt_persona_rewards 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own KNYT rewards" 
  ON public.knyt_persona_rewards 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own KNYT rewards" 
  ON public.knyt_persona_rewards 
  FOR UPDATE 
  USING (auth.uid() = user_id);
