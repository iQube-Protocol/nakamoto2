-- Fix the migration approach - direct update using email matching
-- Update info+2@metame.com specifically first
UPDATE public.knyt_personas 
SET 
  "OM-Member-Since" = '2021-03-19',
  "OM-Tier-Status" = COALESCE((
    SELECT iu.persona_data->>'OM-Tier-Status' 
    FROM invited_users iu 
    WHERE iu.email = 'info+2@metame.com' 
      AND iu.persona_type = 'knyt' 
    LIMIT 1
  ), "OM-Tier-Status"),
  "Metaiye-Shares-Owned" = '20',
  "Total-Invested" = '103.5',
  updated_at = now()
WHERE user_id = 'f36a2de1-f839-41d1-aede-797fe6ba53d9';

-- Update all other missing KNYT data using a simpler approach
UPDATE public.knyt_personas 
SET 
  "OM-Member-Since" = CASE 
    WHEN COALESCE("OM-Member-Since", '') = '' THEN
      (SELECT iu.persona_data->>'OM-Member-Since' 
       FROM invited_users iu 
       JOIN auth.users au ON iu.email = au.email 
       WHERE au.id = knyt_personas.user_id 
         AND iu.persona_type = 'knyt' 
       LIMIT 1)
    ELSE "OM-Member-Since"
  END,
  "OM-Tier-Status" = CASE 
    WHEN COALESCE("OM-Tier-Status", '') = '' THEN
      (SELECT iu.persona_data->>'OM-Tier-Status' 
       FROM invited_users iu 
       JOIN auth.users au ON iu.email = au.email 
       WHERE au.id = knyt_personas.user_id 
         AND iu.persona_type = 'knyt' 
       LIMIT 1)
    ELSE "OM-Tier-Status"
  END,
  "Metaiye-Shares-Owned" = CASE 
    WHEN COALESCE("Metaiye-Shares-Owned", '') = '' THEN
      (SELECT iu.persona_data->>'Metaiye-Shares-Owned' 
       FROM invited_users iu 
       JOIN auth.users au ON iu.email = au.email 
       WHERE au.id = knyt_personas.user_id 
         AND iu.persona_type = 'knyt' 
       LIMIT 1)
    ELSE "Metaiye-Shares-Owned"
  END,
  "Total-Invested" = CASE 
    WHEN COALESCE("Total-Invested", '') = '' THEN
      (SELECT iu.persona_data->>'Total-Invested' 
       FROM invited_users iu 
       JOIN auth.users au ON iu.email = au.email 
       WHERE au.id = knyt_personas.user_id 
         AND iu.persona_type = 'knyt' 
       LIMIT 1)
    ELSE "Total-Invested"
  END,
  updated_at = now()
WHERE EXISTS (
  SELECT 1 FROM auth.users au 
  JOIN invited_users iu ON au.email = iu.email 
  WHERE au.id = knyt_personas.user_id 
    AND iu.persona_type = 'knyt'
    AND (
      COALESCE("OM-Member-Since", '') = '' OR
      COALESCE("OM-Tier-Status", '') = '' OR
      COALESCE("Metaiye-Shares-Owned", '') = '' OR
      COALESCE("Total-Invested", '') = ''
    )
);