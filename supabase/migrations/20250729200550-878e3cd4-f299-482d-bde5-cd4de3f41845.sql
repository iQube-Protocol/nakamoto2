-- Extend all expired invitations by 30 days from now
UPDATE public.invited_users 
SET expires_at = now() + interval '30 days'
WHERE expires_at < now();

-- Fix Hugh Stiel's duplicated last name in persona_data
UPDATE public.invited_users 
SET persona_data = jsonb_set(
  persona_data, 
  '{Last-Name}', 
  '"Stiel"'
)
WHERE email = 'hugh@spiraledge.com' 
  AND persona_data->>'Last-Name' = 'Stiel Stiel';