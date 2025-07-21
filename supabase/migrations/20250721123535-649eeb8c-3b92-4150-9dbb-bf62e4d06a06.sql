-- Create simplified data recovery function to fix existing broken signups
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
      AND au.created_at >= (now() - interval '7 days')
      AND (
        (iu.persona_type = 'knyt' AND NOT EXISTS (SELECT 1 FROM public.knyt_personas kp WHERE kp.user_id = au.id))
        OR
        (iu.persona_type = 'qrypto' AND NOT EXISTS (SELECT 1 FROM public.qrypto_personas qp WHERE qp.user_id = au.id))
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

-- Create monitoring view for invitation signup tracking
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