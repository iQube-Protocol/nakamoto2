-- Fix incomplete persona data migration for all affected users
-- This migration reconciles persona data with original invitation data

-- Update KNYT personas with missing data from their invitations
UPDATE public.knyt_personas 
SET 
  "OM-Member-Since" = COALESCE(invitation_record.persona_data->>'OM-Member-Since', "OM-Member-Since"),
  "OM-Tier-Status" = COALESCE(invitation_record.persona_data->>'OM-Tier-Status', "OM-Tier-Status"),
  "Metaiye-Shares-Owned" = COALESCE(invitation_record.persona_data->>'Metaiye-Shares-Owned', "Metaiye-Shares-Owned"),
  "Total-Invested" = COALESCE(invitation_record.persona_data->>'Total-Invested', "Total-Invested"),
  "KNYT-COYN-Owned" = COALESCE(invitation_record.persona_data->>'KNYT-COYN-Owned', "KNYT-COYN-Owned"),
  "Motion-Comics-Owned" = COALESCE(invitation_record.persona_data->>'Motion-Comics-Owned', "Motion-Comics-Owned"),
  "Paper-Comics-Owned" = COALESCE(invitation_record.persona_data->>'Paper-Comics-Owned', "Paper-Comics-Owned"),
  "Digital-Comics-Owned" = COALESCE(invitation_record.persona_data->>'Digital-Comics-Owned', "Digital-Comics-Owned"),
  "KNYT-Posters-Owned" = COALESCE(invitation_record.persona_data->>'KNYT-Posters-Owned', "KNYT-Posters-Owned"),
  "KNYT-Cards-Owned" = COALESCE(invitation_record.persona_data->>'KNYT-Cards-Owned', "KNYT-Cards-Owned"),
  "Characters-Owned" = COALESCE(invitation_record.persona_data->>'Characters-Owned', "Characters-Owned"),
  updated_at = now()
FROM (
  SELECT DISTINCT ON (u.email) 
    u.email,
    iu.persona_data,
    iu.persona_type
  FROM auth.users u
  JOIN public.invited_users iu ON u.email = iu.email
  WHERE iu.persona_type = 'knyt' 
    AND iu.signup_completed = true
) AS invitation_record
JOIN auth.users auth_user ON auth_user.email = invitation_record.email
WHERE knyt_personas.user_id = auth_user.id
  AND invitation_record.persona_type = 'knyt'
  AND (
    -- Only update if any of these fields are empty or null
    COALESCE("OM-Member-Since", '') = '' OR
    COALESCE("OM-Tier-Status", '') = '' OR
    COALESCE("Metaiye-Shares-Owned", '') = '' OR
    COALESCE("Total-Invested", '') = '' OR
    COALESCE("KNYT-COYN-Owned", '') = '' OR
    COALESCE("Motion-Comics-Owned", '') = '' OR
    COALESCE("Paper-Comics-Owned", '') = '' OR
    COALESCE("Digital-Comics-Owned", '') = '' OR
    COALESCE("KNYT-Posters-Owned", '') = '' OR
    COALESCE("KNYT-Cards-Owned", '') = '' OR
    COALESCE("Characters-Owned", '') = ''
  );

-- Update Qrypto personas with missing data from their invitations
UPDATE public.qrypto_personas 
SET 
  "GitHub-Handle" = COALESCE(invitation_record.persona_data->>'GitHub-Handle', "GitHub-Handle"),
  updated_at = now()
FROM (
  SELECT DISTINCT ON (u.email) 
    u.email,
    iu.persona_data,
    iu.persona_type
  FROM auth.users u
  JOIN public.invited_users iu ON u.email = iu.email
  WHERE iu.persona_type = 'qrypto' 
    AND iu.signup_completed = true
) AS invitation_record
JOIN auth.users auth_user ON auth_user.email = invitation_record.email
WHERE qrypto_personas.user_id = auth_user.id
  AND invitation_record.persona_type = 'qrypto'
  AND COALESCE("GitHub-Handle", '') = '';

-- Log the migration results
DO $$
DECLARE
  knyt_updated_count INTEGER;
  qrypto_updated_count INTEGER;
BEGIN
  GET DIAGNOSTICS knyt_updated_count = ROW_COUNT;
  
  -- Get count of qrypto updates (this is approximate since we can't get exact count from previous query)
  SELECT COUNT(*) INTO qrypto_updated_count
  FROM public.qrypto_personas qp
  JOIN auth.users au ON qp.user_id = au.id
  JOIN public.invited_users iu ON au.email = iu.email
  WHERE iu.persona_type = 'qrypto' 
    AND iu.signup_completed = true
    AND COALESCE(qp."GitHub-Handle", '') = '';
    
  RAISE NOTICE 'Migration completed: Updated % KNYT personas and approximately % Qrypto personas', knyt_updated_count, qrypto_updated_count;
END $$;