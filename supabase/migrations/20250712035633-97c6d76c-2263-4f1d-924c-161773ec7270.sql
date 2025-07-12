-- Restore KNYT persona names from invitation data for accounts overwritten by LinkedIn
UPDATE public.knyt_personas
SET 
  "First-Name" = invitation_record.persona_data->>'First-Name',
  "Last-Name" = invitation_record.persona_data->>'Last-Name'
FROM (
  SELECT 
    au.id as user_id,
    iu.persona_data,
    iu.persona_data->>'First-Name' as invite_first_name,
    iu.persona_data->>'Last-Name' as invite_last_name
  FROM auth.users au
  JOIN public.invited_users iu ON au.email = iu.email
  WHERE iu.persona_type = 'knyt' 
    AND iu.signup_completed = true
    AND iu.persona_data->>'First-Name' IS NOT NULL
    AND iu.persona_data->>'Last-Name' IS NOT NULL
) invitation_record
JOIN public.knyt_personas kp ON kp.user_id = invitation_record.user_id
WHERE (
  kp."First-Name" != invitation_record.invite_first_name 
  OR kp."Last-Name" != invitation_record.invite_last_name
)
AND knyt_personas.user_id = invitation_record.user_id;