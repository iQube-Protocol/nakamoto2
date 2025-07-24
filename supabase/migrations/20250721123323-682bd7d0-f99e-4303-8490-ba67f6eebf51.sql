
-- Step 1: Fix the logic error in handle_new_user_personas function
-- The current logic is backwards - it should create personas for users WITHOUT invitations
CREATE OR REPLACE FUNCTION public.handle_new_user_personas()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  invitation_exists BOOLEAN;
BEGIN
  -- Check if user has ANY invitation record (regardless of status)
  SELECT EXISTS(
    SELECT 1 
    FROM public.invited_users 
    WHERE email = NEW.email 
  ) INTO invitation_exists;
  
  -- Only create default personas if NO invitation record exists at all
  -- This is for direct signups (users who register without an invitation)
  IF NOT invitation_exists THEN
    -- Insert KNYT persona with empty default values
    INSERT INTO public.knyt_personas (
      user_id,
      "Email"
    ) VALUES (
      NEW.id,
      COALESCE(NEW.email, '')
    );
    
    -- Insert Qrypto persona with empty default values  
    INSERT INTO public.qrypto_personas (
      user_id,
      "Email"
    ) VALUES (
      NEW.id,
      COALESCE(NEW.email, '')
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Step 2: Enhance the invited user signup function with better error handling and logging
CREATE OR REPLACE FUNCTION public.handle_invited_user_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  invitation_record public.invited_users%ROWTYPE;
  error_message text;
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
    BEGIN
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

    EXCEPTION WHEN OTHERS THEN
      -- Log error but don't block user creation
      error_message := SQLERRM;
      RAISE WARNING 'Error in handle_invited_user_signup for user % email %: %', NEW.id, NEW.email, error_message;
      -- Still allow the user to be created, just log the error
    END;
  END IF;

  RETURN NEW;
END;
$$;

-- Step 3: Create a data recovery function to fix existing broken signups
CREATE OR REPLACE FUNCTION public.recover_incomplete_invited_signups()
RETURNS TABLE(
  user_email text,
  invitation_id uuid,
  user_id uuid,
  persona_type text,
  recovery_status text
) AS $$
DECLARE
  rec RECORD;
  recovery_result text;
BEGIN
  -- Find users who signed up from invitations but don't have persona data
  FOR rec IN 
    SELECT 
      au.id as auth_user_id,
      au.email as auth_email,
      iu.id as invitation_id,
      iu.persona_type,
      iu.persona_data
    FROM auth.users au
    JOIN public.invited_users iu ON au.email = iu.email
    WHERE iu.signup_completed = false
      AND au.created_at >= (now() - interval '7 days') -- Recent signups
      AND NOT EXISTS (
        CASE 
          WHEN iu.persona_type = 'knyt' THEN 
            (SELECT 1 FROM public.knyt_personas kp WHERE kp.user_id = au.id)
          ELSE 
            (SELECT 1 FROM public.qrypto_personas qp WHERE qp.user_id = au.id)
        END
      )
  LOOP
    BEGIN
      -- Attempt to create the missing persona data
      IF rec.persona_type = 'knyt' THEN
        INSERT INTO public.knyt_personas (
          user_id, "Email", "First-Name", "Last-Name", "Profession", "Local-City"
        ) VALUES (
          rec.auth_user_id,
          rec.auth_email,
          COALESCE(rec.persona_data->>'First-Name', ''),
          COALESCE(rec.persona_data->>'Last-Name', ''),
          COALESCE(rec.persona_data->>'Profession', ''),
          COALESCE(rec.persona_data->>'Local-City', '')
        );
      ELSE
        INSERT INTO public.qrypto_personas (
          user_id, "Email", "First-Name", "Last-Name", "Profession", "Local-City"
        ) VALUES (
          rec.auth_user_id,
          rec.auth_email,
          COALESCE(rec.persona_data->>'First-Name', ''),
          COALESCE(rec.persona_data->>'Last-Name', ''),
          COALESCE(rec.persona_data->>'Profession', ''),
          COALESCE(rec.persona_data->>'Local-City', '')
        );
      END IF;

      -- Mark invitation as completed
      UPDATE public.invited_users 
      SET signup_completed = true, completed_at = now()
      WHERE id = rec.invitation_id;

      recovery_result := 'SUCCESS';
      
    EXCEPTION WHEN OTHERS THEN
      recovery_result := 'ERROR: ' || SQLERRM;
    END;

    -- Return the result
    user_email := rec.auth_email;
    invitation_id := rec.invitation_id;
    user_id := rec.auth_user_id;
    persona_type := rec.persona_type;
    recovery_status := recovery_result;
    RETURN NEXT;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Create monitoring queries for invitation signup tracking
CREATE OR REPLACE VIEW public.invitation_signup_stats AS
SELECT 
  date_trunc('day', iu.invited_at) as invitation_date,
  iu.persona_type,
  COUNT(*) as total_invitations,
  COUNT(*) FILTER (WHERE iu.signup_completed = true) as completed_signups,
  COUNT(*) FILTER (WHERE iu.email_sent = true) as emails_sent,
  COUNT(*) FILTER (WHERE iu.signup_completed = false AND iu.expires_at > now()) as pending_signups,
  ROUND(
    (COUNT(*) FILTER (WHERE iu.signup_completed = true)::numeric / 
     NULLIF(COUNT(*) FILTER (WHERE iu.email_sent = true), 0) * 100), 2
  ) as conversion_rate_percent
FROM public.invited_users iu
WHERE iu.invited_at >= (now() - interval '30 days')
GROUP BY date_trunc('day', iu.invited_at), iu.persona_type
ORDER BY invitation_date DESC, iu.persona_type;

-- Step 5: Run the recovery function to fix existing data
SELECT * FROM public.recover_incomplete_invited_signups();
