-- Enhanced recovery function to handle pre-existing users
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix the 4 specific edge case users in a safe transaction
DO $$
DECLARE
  target_emails text[] := ARRAY['dele@arkagent.com', 'nikbri6521@yahoo.com', 'info+2@metame.com', 'dele@metame.com'];
  email_addr text;
  update_count integer := 0;
BEGIN
  -- Process each target email safely
  FOREACH email_addr IN ARRAY target_emails
  LOOP
    -- Only update if user exists, has invitation, has persona, but signup_completed is false
    UPDATE public.invited_users 
    SET signup_completed = true, completed_at = now()
    WHERE email = email_addr
      AND signup_completed = false
      AND EXISTS (
        SELECT 1 FROM auth.users au 
        WHERE au.email = email_addr
        AND (
          (invited_users.persona_type = 'knyt' AND EXISTS (SELECT 1 FROM public.knyt_personas kp WHERE kp.user_id = au.id))
          OR
          (invited_users.persona_type = 'qrypto' AND EXISTS (SELECT 1 FROM public.qrypto_personas qp WHERE qp.user_id = au.id))
        )
      );
    
    GET DIAGNOSTICS update_count = ROW_COUNT;
    
    -- Log the update for audit trail
    RAISE NOTICE 'Updated invitation for %: % rows affected', email_addr, update_count;
  END LOOP;
  
  RAISE NOTICE 'Edge case user fix completed successfully';
END;
$$;