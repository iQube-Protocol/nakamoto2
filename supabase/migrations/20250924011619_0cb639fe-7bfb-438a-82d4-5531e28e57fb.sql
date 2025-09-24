-- Rename qrypto_personas table to qripto_personas
ALTER TABLE public.qrypto_personas RENAME TO qripto_personas;

-- Update any column references that contain "Qrypto" to "Qripto"
ALTER TABLE public.qripto_personas RENAME COLUMN "Qrypto-ID" TO "Qripto-ID";

-- Update RLS policies to reference the new table name
DROP POLICY IF EXISTS "Users can create their own Qrypto persona" ON public.qripto_personas;
DROP POLICY IF EXISTS "Users can delete their own Qrypto persona" ON public.qripto_personas;
DROP POLICY IF EXISTS "Users can update their own Qrypto persona" ON public.qripto_personas;
DROP POLICY IF EXISTS "Users can view their own Qrypto persona" ON public.qripto_personas;

-- Recreate RLS policies with new names
CREATE POLICY "Users can create their own Qripto persona" 
ON public.qripto_personas 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own Qripto persona" 
ON public.qripto_personas 
FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own Qripto persona" 
ON public.qripto_personas 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own Qripto persona" 
ON public.qripto_personas 
FOR SELECT 
USING (auth.uid() = user_id);

-- Update any triggers that reference the old table name
DROP TRIGGER IF EXISTS update_qrypto_personas_updated_at ON public.qripto_personas;
CREATE TRIGGER update_qripto_personas_updated_at
  BEFORE UPDATE ON public.qripto_personas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Update any database functions that reference qrypto_personas
CREATE OR REPLACE FUNCTION public.handle_invited_user_signup()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
    ELSIF invitation_record.persona_type = 'qripto' THEN
      -- Insert into qripto_personas table (updated table name)
      INSERT INTO public.qripto_personas (
        user_id,
        "First-Name",
        "Last-Name",
        "Qripto-ID", 
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
        COALESCE(invitation_record.persona_data->>'Qripto-ID', ''),
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
$function$;

-- Update handle_new_user_personas function to reference qripto_personas
CREATE OR REPLACE FUNCTION public.handle_new_user_personas()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  invitation_exists BOOLEAN;
BEGIN
  -- Check if user has ANY invitation record (regardless of status)
  -- This eliminates race condition with handle_invited_user_signup
  SELECT EXISTS(
    SELECT 1 
    FROM public.invited_users 
    WHERE email = NEW.email 
  ) INTO invitation_exists;
  
  -- Only create default personas if no invitation record exists at all
  IF NOT invitation_exists THEN
    -- Insert KNYT persona with empty default values
    INSERT INTO public.knyt_personas (
      user_id,
      "Email"
    ) VALUES (
      NEW.id,
      COALESCE(NEW.email, '')
    );
    
    -- Insert Qripto persona with empty default values (updated table name)
    INSERT INTO public.qripto_personas (
      user_id,
      "Email"
    ) VALUES (
      NEW.id,
      COALESCE(NEW.email, '')
    );
  END IF;
  
  RETURN NEW;
END;
$function$;