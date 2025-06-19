
-- Create table to store invited users with their persona data
CREATE TABLE public.invited_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  invitation_token TEXT NOT NULL UNIQUE DEFAULT gen_random_uuid()::text,
  persona_type TEXT NOT NULL CHECK (persona_type IN ('knyt', 'qrypto')),
  persona_data JSONB NOT NULL,
  invited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  invited_by TEXT,
  signup_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '30 days')
);

-- Create index for faster lookups
CREATE INDEX idx_invited_users_email ON public.invited_users(email);
CREATE INDEX idx_invited_users_token ON public.invited_users(invitation_token);
CREATE INDEX idx_invited_users_pending ON public.invited_users(signup_completed, expires_at);

-- Add RLS policies
ALTER TABLE public.invited_users ENABLE ROW LEVEL SECURITY;

-- Policy for reading invitations (public access for signup flow)
CREATE POLICY "Anyone can read valid invitations" 
  ON public.invited_users 
  FOR SELECT 
  USING (NOT signup_completed AND expires_at > now());

-- Policy for updating invitations during signup
CREATE POLICY "Anyone can complete their own invitation" 
  ON public.invited_users 
  FOR UPDATE 
  USING (NOT signup_completed AND expires_at > now());

-- Function to automatically populate persona data after user signup
CREATE OR REPLACE FUNCTION public.handle_invited_user_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  invitation_record public.invited_users%ROWTYPE;
BEGIN
  -- Look for pending invitation with this email
  SELECT * INTO invitation_record
  FROM public.invited_users
  WHERE email = NEW.email 
    AND NOT signup_completed 
    AND expires_at > now()
  LIMIT 1;

  -- If invitation exists, populate persona data
  IF FOUND THEN
    -- Insert into appropriate persona table based on type
    IF invitation_record.persona_type = 'knyt' THEN
      INSERT INTO public.knyt_personas (
        user_id,
        "First-Name",
        "Last-Name", 
        "KNYT-ID",
        "Profession",
        "Local-City",
        "Email",
        "Phone-Number",
        "Age",
        "Address",
        "EVM-Public-Key",
        "BTC-Public-Key",
        "ThirdWeb-Public-Key",
        "MetaKeep-Public-Key",
        "Chain-IDs",
        "Web3-Interests",
        "Tokens-of-Interest",
        "LinkedIn-ID",
        "LinkedIn-Profile-URL",
        "Twitter-Handle",
        "Telegram-Handle",
        "Discord-Handle",
        "Instagram-Handle",
        "YouTube-ID",
        "Facebook-ID",
        "TikTok-Handle",
        "OM-Member-Since",
        "OM-Tier-Status",
        "Metaiye-Shares-Owned",
        "Total-Invested",
        "KNYT-COYN-Owned",
        "Motion-Comics-Owned",
        "Paper-Comics-Owned",
        "Digital-Comics-Owned",
        "KNYT-Posters-Owned",
        "KNYT-Cards-Owned",
        "Characters-Owned"
      ) VALUES (
        NEW.id,
        COALESCE(invitation_record.persona_data->>'First-Name', ''),
        COALESCE(invitation_record.persona_data->>'Last-Name', ''),
        COALESCE(invitation_record.persona_data->>'KNYT-ID', ''),
        COALESCE(invitation_record.persona_data->>'Profession', ''),
        COALESCE(invitation_record.persona_data->>'Local-City', ''),
        COALESCE(invitation_record.persona_data->>'Email', NEW.email),
        COALESCE(invitation_record.persona_data->>'Phone-Number', ''),
        COALESCE(invitation_record.persona_data->>'Age', ''),
        COALESCE(invitation_record.persona_data->>'Address', ''),
        COALESCE(invitation_record.persona_data->>'EVM-Public-Key', ''),
        COALESCE(invitation_record.persona_data->>'BTC-Public-Key', ''),
        COALESCE(invitation_record.persona_data->>'ThirdWeb-Public-Key', ''),
        COALESCE(invitation_record.persona_data->>'MetaKeep-Public-Key', ''),
        COALESCE(
          ARRAY(SELECT jsonb_array_elements_text(invitation_record.persona_data->'Chain-IDs')),
          '{}'::text[]
        ),
        COALESCE(
          ARRAY(SELECT jsonb_array_elements_text(invitation_record.persona_data->'Web3-Interests')),
          '{}'::text[]
        ),
        COALESCE(
          ARRAY(SELECT jsonb_array_elements_text(invitation_record.persona_data->'Tokens-of-Interest')),
          '{}'::text[]
        ),
        COALESCE(invitation_record.persona_data->>'LinkedIn-ID', ''),
        COALESCE(invitation_record.persona_data->>'LinkedIn-Profile-URL', ''),
        COALESCE(invitation_record.persona_data->>'Twitter-Handle', ''),
        COALESCE(invitation_record.persona_data->>'Telegram-Handle', ''),
        COALESCE(invitation_record.persona_data->>'Discord-Handle', ''),
        COALESCE(invitation_record.persona_data->>'Instagram-Handle', ''),
        COALESCE(invitation_record.persona_data->>'YouTube-ID', ''),
        COALESCE(invitation_record.persona_data->>'Facebook-ID', ''),
        COALESCE(invitation_record.persona_data->>'TikTok-Handle', ''),
        COALESCE(invitation_record.persona_data->>'OM-Member-Since', ''),
        COALESCE(invitation_record.persona_data->>'OM-Tier-Status', ''),
        COALESCE(invitation_record.persona_data->>'Metaiye-Shares-Owned', ''),
        COALESCE(invitation_record.persona_data->>'Total-Invested', ''),
        COALESCE(invitation_record.persona_data->>'KNYT-COYN-Owned', ''),
        COALESCE(invitation_record.persona_data->>'Motion-Comics-Owned', ''),
        COALESCE(invitation_record.persona_data->>'Paper-Comics-Owned', ''),
        COALESCE(invitation_record.persona_data->>'Digital-Comics-Owned', ''),
        COALESCE(invitation_record.persona_data->>'KNYT-Posters-Owned', ''),
        COALESCE(invitation_record.persona_data->>'KNYT-Cards-Owned', ''),
        COALESCE(invitation_record.persona_data->>'Characters-Owned', '')
      );
    ELSE
      -- Insert into qrypto_personas table
      INSERT INTO public.qrypto_personas (
        user_id,
        "First-Name",
        "Last-Name",
        "Qrypto-ID", 
        "Profession",
        "Local-City",
        "Email",
        "EVM-Public-Key",
        "BTC-Public-Key",
        "Chain-IDs",
        "Wallets-of-Interest",
        "Web3-Interests",
        "Tokens-of-Interest",
        "LinkedIn-ID",
        "LinkedIn-Profile-URL",
        "Twitter-Handle",
        "Telegram-Handle",
        "Discord-Handle",
        "Instagram-Handle",
        "GitHub-Handle",
        "YouTube-ID",
        "Facebook-ID",
        "TikTok-Handle"
      ) VALUES (
        NEW.id,
        COALESCE(invitation_record.persona_data->>'First-Name', ''),
        COALESCE(invitation_record.persona_data->>'Last-Name', ''),
        COALESCE(invitation_record.persona_data->>'Qrypto-ID', ''),
        COALESCE(invitation_record.persona_data->>'Profession', ''),
        COALESCE(invitation_record.persona_data->>'Local-City', ''),
        COALESCE(invitation_record.persona_data->>'Email', NEW.email),
        COALESCE(invitation_record.persona_data->>'EVM-Public-Key', ''),
        COALESCE(invitation_record.persona_data->>'BTC-Public-Key', ''),
        COALESCE(
          ARRAY(SELECT jsonb_array_elements_text(invitation_record.persona_data->'Chain-IDs')),
          '{}'::text[]
        ),
        COALESCE(
          ARRAY(SELECT jsonb_array_elements_text(invitation_record.persona_data->'Wallets-of-Interest')),
          '{}'::text[]
        ),
        COALESCE(
          ARRAY(SELECT jsonb_array_elements_text(invitation_record.persona_data->'Web3-Interests')),
          '{}'::text[]
        ),
        COALESCE(
          ARRAY(SELECT jsonb_array_elements_text(invitation_record.persona_data->'Tokens-of-Interest')),
          '{}'::text[]
        ),
        COALESCE(invitation_record.persona_data->>'LinkedIn-ID', ''),
        COALESCE(invitation_record.persona_data->>'LinkedIn-Profile-URL', ''),
        COALESCE(invitation_record.persona_data->>'Twitter-Handle', ''),
        COALESCE(invitation_record.persona_data->>'Telegram-Handle', ''),
        COALESCE(invitation_record.persona_data->>'Discord-Handle', ''),
        COALESCE(invitation_record.persona_data->>'Instagram-Handle', ''),
        COALESCE(invitation_record.persona_data->>'GitHub-Handle', ''),
        COALESCE(invitation_record.persona_data->>'YouTube-ID', ''),
        COALESCE(invitation_record.persona_data->>'Facebook-ID', ''),
        COALESCE(invitation_record.persona_data->>'TikTok-Handle', '')
      );
    END IF;

    -- Mark invitation as completed
    UPDATE public.invited_users 
    SET signup_completed = true, completed_at = now()
    WHERE id = invitation_record.id;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger to run after user signup
CREATE TRIGGER on_auth_user_created_handle_invitation
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_invited_user_signup();
