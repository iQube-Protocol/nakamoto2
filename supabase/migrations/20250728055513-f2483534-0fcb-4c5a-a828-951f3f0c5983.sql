-- Run reconciliation for the users who signed up but don't have complete invitation records
-- Fix user ceokeke@hotmail.com who has invitation but signup not marked complete
UPDATE invited_users 
SET signup_completed = true, 
    completed_at = NOW()
WHERE email = 'ceokeke@hotmail.com' 
AND id = '723f5db2-fdab-4da6-a3e0-75c421ef24d0';

-- Create default invitation records for users who signed up without invitations 
-- This ensures they appear in our dashboard statistics
INSERT INTO invited_users (
  email, 
  persona_type, 
  persona_data, 
  email_sent, 
  email_sent_at,
  signup_completed, 
  completed_at,
  invited_at,
  batch_id
) VALUES 
-- Direct signups that need tracking
('lenbsmith1971@hotmail.com', 'knyt', '{"Email": "lenbsmith1971@hotmail.com", "First-Name": "", "Last-Name": ""}', true, '2025-07-27 04:14:23.085836+00', true, '2025-07-27 04:14:23.085836+00', '2025-07-27 04:14:23.085836+00', 'direct_signup'),
('reeselasley@gmail.com', 'knyt', '{"Email": "reeselasley@gmail.com", "First-Name": "", "Last-Name": ""}', true, '2025-07-23 23:30:13.653207+00', true, '2025-07-23 23:30:13.653207+00', '2025-07-23 23:30:13.653207+00', 'direct_signup'),
('tom@dsalliance.io', 'knyt', '{"Email": "tom@dsalliance.io", "First-Name": "", "Last-Name": ""}', true, '2025-07-22 16:28:57.587328+00', true, '2025-07-22 16:28:57.587328+00', '2025-07-22 16:28:57.587328+00', 'direct_signup'),
('info+9@metame.com', 'knyt', '{"Email": "info+9@metame.com", "First-Name": "", "Last-Name": ""}', true, '2025-07-21 03:14:09.50902+00', true, '2025-07-21 03:14:09.50902+00', '2025-07-21 03:14:09.50902+00', 'direct_signup'),
('shat43@gmail.com', 'knyt', '{"Email": "shat43@gmail.com", "First-Name": "", "Last-Name": ""}', true, '2025-07-20 16:50:29.562211+00', true, '2025-07-20 16:50:29.562211+00', '2025-07-20 16:50:29.562211+00', 'direct_signup'),
('lybothell2024@gmail.com', 'knyt', '{"Email": "lybothell2024@gmail.com", "First-Name": "", "Last-Name": ""}', true, '2025-07-16 16:32:24.075992+00', true, '2025-07-16 16:32:24.075992+00', '2025-07-16 16:32:24.075992+00', 'direct_signup'),
('adigun@sonicverse.net', 'knyt', '{"Email": "adigun@sonicverse.net", "First-Name": "", "Last-Name": ""}', true, '2025-07-16 14:54:13.556027+00', true, '2025-07-16 14:54:13.556027+00', '2025-07-16 14:54:13.556027+00', 'direct_signup'),
('dele+8@digitteria.com', 'knyt', '{"Email": "dele+8@digitteria.com", "First-Name": "", "Last-Name": ""}', true, '2025-07-14 20:34:35.817005+00', true, '2025-07-14 20:34:35.817005+00', '2025-07-14 20:34:35.817005+00', 'direct_signup'),
('sd5287@gmail.com', 'knyt', '{"Email": "sd5287@gmail.com", "First-Name": "", "Last-Name": ""}', true, '2025-07-14 18:14:32.495079+00', true, '2025-07-14 18:14:32.495079+00', '2025-07-14 18:14:32.495079+00', 'direct_signup'),
('akhenatanda@gmail.com', 'knyt', '{"Email": "akhenatanda@gmail.com", "First-Name": "", "Last-Name": ""}', true, '2025-07-13 02:23:31.542003+00', true, '2025-07-13 02:23:31.542003+00', '2025-07-13 02:23:31.542003+00', 'direct_signup'),
('info+22@metame.com', 'knyt', '{"Email": "info+22@metame.com", "First-Name": "", "Last-Name": ""}', true, '2025-07-13 00:35:17.349542+00', true, '2025-07-13 00:35:17.349542+00', '2025-07-13 00:35:17.349542+00', 'direct_signup'),
('info+21@metame.com', 'knyt', '{"Email": "info+21@metame.com", "First-Name": "", "Last-Name": ""}', true, '2025-07-11 04:04:59.659286+00', true, '2025-07-11 04:04:59.659286+00', '2025-07-11 04:04:59.659286+00', 'direct_signup'),
('info+20@metame.com', 'knyt', '{"Email": "info+20@metame.com", "First-Name": "", "Last-Name": ""}', true, '2025-07-11 03:56:19.553865+00', true, '2025-07-11 03:56:19.553865+00', '2025-07-11 03:56:19.553865+00', 'direct_signup'),
('dele+5@digitteria.com', 'knyt', '{"Email": "dele+5@digitteria.com", "First-Name": "", "Last-Name": ""}', true, '2025-07-11 02:03:47.029341+00', true, '2025-07-11 02:03:47.029341+00', '2025-07-11 02:03:47.029341+00', 'direct_signup'),
('dele+4@digitteria.com', 'knyt', '{"Email": "dele+4@digitteria.com", "First-Name": "", "Last-Name": ""}', true, '2025-07-11 02:00:21.939875+00', true, '2025-07-11 02:00:21.939875+00', '2025-07-11 02:00:21.939875+00', 'direct_signup'),
('dele+2@digitteria.com', 'knyt', '{"Email": "dele+2@digitteria.com", "First-Name": "", "Last-Name": ""}', true, '2025-07-11 01:51:30.802218+00', true, '2025-07-11 01:51:30.802218+00', '2025-07-11 01:51:30.802218+00', 'direct_signup'),
('dele+1@digitteria.com', 'knyt', '{"Email": "dele+1@digitteria.com", "First-Name": "", "Last-Name": ""}', true, '2025-07-11 01:47:34.534156+00', true, '2025-07-11 01:47:34.534156+00', '2025-07-11 01:47:34.534156+00', 'direct_signup'),
('dean@thewatchmenagency.com', 'knyt', '{"Email": "dean@thewatchmenagency.com", "First-Name": "", "Last-Name": ""}', true, '2025-06-28 21:24:10.345108+00', true, '2025-06-28 21:24:10.345108+00', '2025-06-28 21:24:10.345108+00', 'direct_signup'),
('nakamoto@metame.com', 'knyt', '{"Email": "nakamoto@metame.com", "First-Name": "", "Last-Name": ""}', true, '2025-06-19 03:23:08.308772+00', true, '2025-06-19 03:23:08.308772+00', '2025-06-19 03:23:08.308772+00', 'direct_signup'),
('admin@nakamoto.com', 'knyt', '{"Email": "admin@nakamoto.com", "First-Name": "", "Last-Name": ""}', true, '2025-06-19 03:13:32.3047+00', true, '2025-06-19 03:13:32.3047+00', '2025-06-19 03:13:32.3047+00', 'direct_signup'),
('eric@blocksee.co', 'knyt', '{"Email": "eric@blocksee.co", "First-Name": "", "Last-Name": ""}', true, '2025-06-18 18:21:44.36894+00', true, '2025-06-18 18:21:44.36894+00', '2025-06-18 18:21:44.36894+00', 'direct_signup'),
('deusthemonster@gmail.com', 'knyt', '{"Email": "deusthemonster@gmail.com", "First-Name": "", "Last-Name": ""}', true, '2025-06-16 18:37:53.277433+00', true, '2025-06-16 18:37:53.277433+00', '2025-06-16 18:37:53.277433+00', 'direct_signup'),
('jasongeorge293@gmail.com', 'knyt', '{"Email": "jasongeorge293@gmail.com", "First-Name": "", "Last-Name": ""}', true, '2025-06-16 16:18:43.676469+00', true, '2025-06-16 16:18:43.676469+00', '2025-06-16 16:18:43.676469+00', 'direct_signup'),
('avie018@gmail.com', 'knyt', '{"Email": "avie018@gmail.com", "First-Name": "", "Last-Name": ""}', true, '2025-06-16 13:51:54.366179+00', true, '2025-06-16 13:51:54.366179+00', '2025-06-16 13:51:54.366179+00', 'direct_signup'),
('info@4am.global', 'knyt', '{"Email": "info@4am.global", "First-Name": "", "Last-Name": ""}', true, '2025-06-16 11:13:32.020533+00', true, '2025-06-16 11:13:32.020533+00', '2025-06-16 11:13:32.020533+00', 'direct_signup'),
('nakamoto@jaredmoss.com', 'knyt', '{"Email": "nakamoto@jaredmoss.com", "First-Name": "", "Last-Name": ""}', true, '2025-06-15 15:00:23.060842+00', true, '2025-06-15 15:00:23.060842+00', '2025-06-15 15:00:23.060842+00', 'direct_signup'),
('delence@versebooks.com', 'knyt', '{"Email": "delence@versebooks.com", "First-Name": "", "Last-Name": ""}', true, '2025-06-12 21:03:14.291446+00', true, '2025-06-12 21:03:14.291446+00', '2025-06-12 21:03:14.291446+00', 'direct_signup'),
('glasshauslabs@gmail.com', 'knyt', '{"Email": "glasshauslabs@gmail.com", "First-Name": "", "Last-Name": ""}', true, '2025-06-10 11:32:52.756209+00', true, '2025-06-10 11:32:52.756209+00', '2025-06-10 11:32:52.756209+00', 'direct_signup'),
('chris.palle@icloud.com', 'knyt', '{"Email": "chris.palle@icloud.com", "First-Name": "", "Last-Name": ""}', true, '2025-06-06 15:33:11.488139+00', true, '2025-06-06 15:33:11.488139+00', '2025-06-06 15:33:11.488139+00', 'direct_signup'),
('ericschedeler@gmail.com', 'knyt', '{"Email": "ericschedeler@gmail.com", "First-Name": "", "Last-Name": ""}', true, '2025-06-01 13:12:23.486448+00', true, '2025-06-01 13:12:23.486448+00', '2025-06-01 13:12:23.486448+00', 'direct_signup'),
('amikahmad@gmail.com', 'knyt', '{"Email": "amikahmad@gmail.com", "First-Name": "", "Last-Name": ""}', true, '2025-05-26 20:26:37.42866+00', true, '2025-05-26 20:26:37.42866+00', '2025-05-26 20:26:37.42866+00', 'direct_signup'),
('amik@autonomys.xyz', 'knyt', '{"Email": "amik@autonomys.xyz", "First-Name": "", "Last-Name": ""}', true, '2025-05-26 20:24:08.235364+00', true, '2025-05-26 20:24:08.235364+00', '2025-05-26 20:24:08.235364+00', 'direct_signup')
ON CONFLICT (email) DO NOTHING;