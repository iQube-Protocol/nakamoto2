-- Fix Hugh Stiel's last name from "Stiel Stiel" to "Stiel"
UPDATE public.invited_users 
SET persona_data = jsonb_set(
  persona_data, 
  '{Last-Name}', 
  '"Stiel"'
)
WHERE persona_data->>'First-Name' = 'Hugh' 
  AND persona_data->>'Last-Name' = 'Stiel Stiel';