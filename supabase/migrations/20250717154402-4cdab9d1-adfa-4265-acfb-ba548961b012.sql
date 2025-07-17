-- Fix KNYT naming corruption by doing replacements in reverse order (longer matches first)
-- This prevents #1 from incorrectly matching #10, #11, #12

-- Update knyt_personas table with correct order
UPDATE public.knyt_personas 
SET 
  "KNYT-Posters-Owned" = CASE 
    WHEN "KNYT-Posters-Owned" IS NOT NULL AND "KNYT-Posters-Owned" != '' THEN
      REPLACE(
        REPLACE(
          REPLACE(
            REPLACE(
              REPLACE(
                REPLACE(
                  REPLACE(
                    REPLACE(
                      REPLACE(
                        REPLACE(
                          REPLACE(
                            REPLACE(
                              REPLACE(
                                -- First, handle any corrupted data by removing incorrect patterns
                                REPLACE(
                                  REPLACE(
                                    REPLACE("KNYT-Posters-Owned", '#1 Sentinel0', '#10'),
                                    '#1 Sentinel1', '#11'),
                                  '#1 Sentinel2', '#12'),
                                -- Now do replacements in reverse order (longest first)
                                '#12', '#12 Kn0w1'),
                              '#11', '#11 Tyrantus'),
                            '#10', '#10 KnytRush'),
                          '#9', '#9 2Sun'),
                        '#8', '#8 Count Roth'),
                      '#7', '#7 General'),
                    '#6', '#6 Courier'),
                  '#5', '#5 Sage'),
                '#4', '#4 Nimrod'),
              '#3', '#3 Spartacus'),
            '#2', '#2 Director'),
          '#1', '#1 Sentinel'),
        '#0', '#0 Deji')
    ELSE "KNYT-Posters-Owned"
  END,
  "KNYT-Cards-Owned" = CASE 
    WHEN "KNYT-Cards-Owned" IS NOT NULL AND "KNYT-Cards-Owned" != '' THEN
      REPLACE(
        REPLACE(
          REPLACE(
            REPLACE(
              REPLACE(
                REPLACE(
                  REPLACE(
                    REPLACE(
                      REPLACE(
                        REPLACE(
                          REPLACE(
                            REPLACE(
                              REPLACE(
                                -- First, handle any corrupted data
                                REPLACE(
                                  REPLACE(
                                    REPLACE("KNYT-Cards-Owned", 'Episode #1 Sentinel0', 'Episode #10'),
                                    'Episode #1 Sentinel1', 'Episode #11'),
                                  'Episode #1 Sentinel2', 'Episode #12'),
                                -- Then do proper replacements in reverse order
                                'Episode #12', '#12 Kn0w1'),
                              'Episode #11', '#11 Tyrantus'),
                            'Episode #10', '#10 KnytRush'),
                          'Episode #9', '#9 2Sun'),
                        'Episode #8', '#8 Count Roth'),
                      'Episode #7', '#7 General'),
                    'Episode #6', '#6 Courier'),
                  'Episode #5', '#5 Sage'),
                'Episode #4', '#4 Nimrod'),
              'Episode #3', '#3 Spartacus'),
            'Episode #2', '#2 Director'),
          'Episode #1', '#1 Sentinel'),
        'Episode #0', '#0 Deji')
    ELSE "KNYT-Cards-Owned"
  END,
  "Characters-Owned" = CASE 
    WHEN "Characters-Owned" IS NOT NULL AND "Characters-Owned" != '' THEN
      REPLACE(
        REPLACE(
          REPLACE(
            REPLACE(
              REPLACE(
                REPLACE(
                  REPLACE(
                    REPLACE(
                      REPLACE(
                        REPLACE(
                          REPLACE(
                            REPLACE(
                              REPLACE(
                                -- First, handle any corrupted data
                                REPLACE(
                                  REPLACE(
                                    REPLACE("Characters-Owned", '#1 Sentinel0', '#10'),
                                    '#1 Sentinel1', '#11'),
                                  '#1 Sentinel2', '#12'),
                                -- Then do proper replacements in reverse order
                                '#12', '#12 Kn0w1'),
                              '#11', '#11 Tyrantus'),
                            '#10', '#10 KnytRush'),
                          '#9', '#9 2Sun'),
                        '#8', '#8 Count Roth'),
                      '#7', '#7 General'),
                    '#6', '#6 Courier'),
                  '#5', '#5 Sage'),
                '#4', '#4 Nimrod'),
              '#3', '#3 Spartacus'),
            '#2', '#2 Director'),
          '#1', '#1 Sentinel'),
        '#0', '#0 Deji')
    ELSE "Characters-Owned"
  END
WHERE "KNYT-Posters-Owned" IS NOT NULL 
   OR "KNYT-Cards-Owned" IS NOT NULL 
   OR "Characters-Owned" IS NOT NULL;

-- Update blak_qubes table with same fix
UPDATE public.blak_qubes
SET 
  "KNYT-Posters-Owned" = CASE 
    WHEN "KNYT-Posters-Owned" IS NOT NULL AND "KNYT-Posters-Owned" != '' THEN
      REPLACE(
        REPLACE(
          REPLACE(
            REPLACE(
              REPLACE(
                REPLACE(
                  REPLACE(
                    REPLACE(
                      REPLACE(
                        REPLACE(
                          REPLACE(
                            REPLACE(
                              REPLACE(
                                -- First, handle any corrupted data
                                REPLACE(
                                  REPLACE(
                                    REPLACE("KNYT-Posters-Owned", '#1 Sentinel0', '#10'),
                                    '#1 Sentinel1', '#11'),
                                  '#1 Sentinel2', '#12'),
                                -- Then do proper replacements in reverse order
                                '#12', '#12 Kn0w1'),
                              '#11', '#11 Tyrantus'),
                            '#10', '#10 KnytRush'),
                          '#9', '#9 2Sun'),
                        '#8', '#8 Count Roth'),
                      '#7', '#7 General'),
                    '#6', '#6 Courier'),
                  '#5', '#5 Sage'),
                '#4', '#4 Nimrod'),
              '#3', '#3 Spartacus'),
            '#2', '#2 Director'),
          '#1', '#1 Sentinel'),
        '#0', '#0 Deji')
    ELSE "KNYT-Posters-Owned"
  END,
  "KNYT-Cards-Owned" = CASE 
    WHEN "KNYT-Cards-Owned" IS NOT NULL AND "KNYT-Cards-Owned" != '' THEN
      REPLACE(
        REPLACE(
          REPLACE(
            REPLACE(
              REPLACE(
                REPLACE(
                  REPLACE(
                    REPLACE(
                      REPLACE(
                        REPLACE(
                          REPLACE(
                            REPLACE(
                              REPLACE(
                                -- First, handle any corrupted data
                                REPLACE(
                                  REPLACE(
                                    REPLACE("KNYT-Cards-Owned", 'Episode #1 Sentinel0', 'Episode #10'),
                                    'Episode #1 Sentinel1', 'Episode #11'),
                                  'Episode #1 Sentinel2', 'Episode #12'),
                                -- Then do proper replacements in reverse order
                                'Episode #12', '#12 Kn0w1'),
                              'Episode #11', '#11 Tyrantus'),
                            'Episode #10', '#10 KnytRush'),
                          'Episode #9', '#9 2Sun'),
                        'Episode #8', '#8 Count Roth'),
                      'Episode #7', '#7 General'),
                    'Episode #6', '#6 Courier'),
                  'Episode #5', '#5 Sage'),
                'Episode #4', '#4 Nimrod'),
              'Episode #3', '#3 Spartacus'),
            'Episode #2', '#2 Director'),
          'Episode #1', '#1 Sentinel'),
        'Episode #0', '#0 Deji')
    ELSE "KNYT-Cards-Owned"
  END,
  "Characters-Owned" = CASE 
    WHEN "Characters-Owned" IS NOT NULL AND "Characters-Owned" != '' THEN
      REPLACE(
        REPLACE(
          REPLACE(
            REPLACE(
              REPLACE(
                REPLACE(
                  REPLACE(
                    REPLACE(
                      REPLACE(
                        REPLACE(
                          REPLACE(
                            REPLACE(
                              REPLACE(
                                -- First, handle any corrupted data
                                REPLACE(
                                  REPLACE(
                                    REPLACE("Characters-Owned", '#1 Sentinel0', '#10'),
                                    '#1 Sentinel1', '#11'),
                                  '#1 Sentinel2', '#12'),
                                -- Then do proper replacements in reverse order
                                '#12', '#12 Kn0w1'),
                              '#11', '#11 Tyrantus'),
                            '#10', '#10 KnytRush'),
                          '#9', '#9 2Sun'),
                        '#8', '#8 Count Roth'),
                      '#7', '#7 General'),
                    '#6', '#6 Courier'),
                  '#5', '#5 Sage'),
                '#4', '#4 Nimrod'),
              '#3', '#3 Spartacus'),
            '#2', '#2 Director'),
          '#1', '#1 Sentinel'),
        '#0', '#0 Deji')
    ELSE "Characters-Owned"
  END
WHERE "KNYT-Posters-Owned" IS NOT NULL 
   OR "KNYT-Cards-Owned" IS NOT NULL 
   OR "Characters-Owned" IS NOT NULL;