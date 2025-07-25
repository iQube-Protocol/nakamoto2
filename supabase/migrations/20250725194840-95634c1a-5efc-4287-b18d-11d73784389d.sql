-- Phase 1: Critical Database Security Fixes
-- Add SET search_path = '' to all existing database functions for security

-- 1. Secure update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- 2. Secure increment_send_attempts function
CREATE OR REPLACE FUNCTION public.increment_send_attempts(target_email text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  UPDATE public.invited_users 
  SET send_attempts = send_attempts + 1
  WHERE email = target_email;
END;
$function$;

-- 3. Secure is_admin_user function
CREATE OR REPLACE FUNCTION public.is_admin_user()
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  -- Check if the current user's email contains 'admin' or 'nakamoto'
  RETURN (
    SELECT CASE 
      WHEN auth.jwt() ->> 'email' LIKE '%admin%' OR auth.jwt() ->> 'email' LIKE '%nakamoto%' 
      THEN true 
      ELSE false 
    END
  );
END;
$function$;

-- 4. Secure handle_invited_user_signup function
CREATE OR REPLACE FUNCTION public.handle_invited_user_signup()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
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
$function$;

-- 5. Secure handle_new_user_personas function
CREATE OR REPLACE FUNCTION public.handle_new_user_personas()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
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
$function$;

-- 6. Secure recover_incomplete_invited_signups function
CREATE OR REPLACE FUNCTION public.recover_incomplete_invited_signups()
 RETURNS TABLE(user_email text, invitation_id uuid, user_id uuid, persona_type text, recovery_status text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  rec RECORD;
  recovery_result text;
BEGIN
  -- Find users who signed up from invitations but don't have persona data OR
  -- Users who have personas but signup_completed is still false
  FOR rec IN 
    SELECT 
      au.id as auth_user_id,
      au.email as auth_email,
      iu.id as invitation_id,
      iu.persona_type,
      iu.persona_data,
      iu.signup_completed,
      CASE 
        WHEN iu.persona_type = 'knyt' THEN EXISTS (SELECT 1 FROM public.knyt_personas kp WHERE kp.user_id = au.id)
        WHEN iu.persona_type = 'qrypto' THEN EXISTS (SELECT 1 FROM public.qrypto_personas qp WHERE qp.user_id = au.id)
        ELSE false
      END as has_persona
    FROM auth.users au
    JOIN public.invited_users iu ON au.email = iu.email
    WHERE iu.signup_completed = false
      AND iu.expires_at > now()
      AND (
        -- Case 1: User signed up but missing persona data
        (iu.persona_type = 'knyt' AND NOT EXISTS (SELECT 1 FROM public.knyt_personas kp WHERE kp.user_id = au.id))
        OR
        (iu.persona_type = 'qrypto' AND NOT EXISTS (SELECT 1 FROM public.qrypto_personas qp WHERE qp.user_id = au.id))
        OR
        -- Case 2: User has persona but signup_completed is false (edge case)
        (iu.persona_type = 'knyt' AND EXISTS (SELECT 1 FROM public.knyt_personas kp WHERE kp.user_id = au.id))
        OR
        (iu.persona_type = 'qrypto' AND EXISTS (SELECT 1 FROM public.qrypto_personas qp WHERE qp.user_id = au.id))
      )
  LOOP
    BEGIN
      -- If user already has persona, just mark invitation as completed
      IF rec.has_persona THEN
        UPDATE public.invited_users 
        SET signup_completed = true, completed_at = now()
        WHERE id = rec.invitation_id;
        
        recovery_result := 'COMPLETED - User already had persona';
        
      ELSE
        -- Create missing persona data
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

        recovery_result := 'SUCCESS - Created persona and marked complete';
      END IF;
      
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
$function$;