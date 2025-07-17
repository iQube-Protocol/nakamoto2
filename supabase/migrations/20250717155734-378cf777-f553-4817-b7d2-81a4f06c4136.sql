-- Fix corrupted KNYT data for specific accounts
UPDATE knyt_personas 
SET 
  "KNYT-Posters-Owned" = REPLACE(REPLACE(REPLACE("KNYT-Posters-Owned", ', #1 Sentinel0, #1 Sentinel1, #1 Sentinel2', ''), ' #1 Sentinel0 KnytRush, #1 Sentinel1 Tyrantus, #1 Sentinel2 Kn0w1', ''), ' Deji, #1 Sentinel Sentinel, #2 Director Director, #3 Spartacus Spartacus, #4 Nimrod Nimrod, #5 Sage Sage, #6 Courier Courier, #7 General General, #8 Count Roth Count Roth, #9 2Sun 2Sun,', ''),
  "KNYT-Cards-Owned" = REPLACE(REPLACE("KNYT-Cards-Owned", 'Episode #0 Deji, Episode #2 Director, Episode #5 Sage, Episode #6 Courier, ', ''), ' Deji, #1 Sentinel Sentinel', ''),
  "Characters-Owned" = REPLACE("Characters-Owned", ' Deji, #1 Sentinel Sentinel', '')
WHERE "Email" IN ('dele@metame.com', 'gisclerc75@gmail.com');

-- Also fix the same data in blak_qubes table if it exists
UPDATE blak_qubes 
SET 
  "KNYT-Posters-Owned" = REPLACE(REPLACE(REPLACE("KNYT-Posters-Owned", ', #1 Sentinel0, #1 Sentinel1, #1 Sentinel2', ''), ' #1 Sentinel0 KnytRush, #1 Sentinel1 Tyrantus, #1 Sentinel2 Kn0w1', ''), ' Deji, #1 Sentinel Sentinel, #2 Director Director, #3 Spartacus Spartacus, #4 Nimrod Nimrod, #5 Sage Sage, #6 Courier Courier, #7 General General, #8 Count Roth Count Roth, #9 2Sun 2Sun,', ''),
  "KNYT-Cards-Owned" = REPLACE(REPLACE("KNYT-Cards-Owned", 'Episode #0 Deji, Episode #2 Director, Episode #5 Sage, Episode #6 Courier, ', ''), ' Deji, #1 Sentinel Sentinel', ''),
  "Characters-Owned" = REPLACE("Characters-Owned", ' Deji, #1 Sentinel Sentinel', '')
WHERE "Email" IN ('dele@metame.com', 'gisclerc75@gmail.com');