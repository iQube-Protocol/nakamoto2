-- Update KNYT naming to include episode numbers and character names
-- This migration transforms existing episode references to include character names

-- Update knyt_personas table
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
                              REPLACE("KNYT-Posters-Owned", '#0', '#0 Deji'),
                              '#1', '#1 Sentinel'),
                            '#2', '#2 Director'),
                          '#3', '#3 Spartacus'),
                        '#4', '#4 Nimrod'),
                      '#5', '#5 Sage'),
                    '#6', '#6 Courier'),
                  '#7', '#7 General'),
                '#8', '#8 Count Roth'),
              '#9', '#9 2Sun'),
            '#10', '#10 KnytRush'),
          '#11', '#11 Tyrantus'),
        '#12', '#12 Kn0w1')
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
                              REPLACE("KNYT-Cards-Owned", '#0', '#0 Deji'),
                              '#1', '#1 Sentinel'),
                            '#2', '#2 Director'),
                          '#3', '#3 Spartacus'),
                        '#4', '#4 Nimrod'),
                      '#5', '#5 Sage'),
                    '#6', '#6 Courier'),
                  '#7', '#7 General'),
                '#8', '#8 Count Roth'),
              '#9', '#9 2Sun'),
            '#10', '#10 KnytRush'),
          '#11', '#11 Tyrantus'),
        '#12', '#12 Kn0w1')
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
                              REPLACE("Characters-Owned", '#0', '#0 Deji'),
                              '#1', '#1 Sentinel'),
                            '#2', '#2 Director'),
                          '#3', '#3 Spartacus'),
                        '#4', '#4 Nimrod'),
                      '#5', '#5 Sage'),
                    '#6', '#6 Courier'),
                  '#7', '#7 General'),
                '#8', '#8 Count Roth'),
              '#9', '#9 2Sun'),
            '#10', '#10 KnytRush'),
          '#11', '#11 Tyrantus'),
        '#12', '#12 Kn0w1')
    ELSE "Characters-Owned"
  END
WHERE "KNYT-Posters-Owned" IS NOT NULL 
   OR "KNYT-Cards-Owned" IS NOT NULL 
   OR "Characters-Owned" IS NOT NULL;

-- Update blak_qubes table  
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
                              REPLACE("KNYT-Posters-Owned", '#0', '#0 Deji'),
                              '#1', '#1 Sentinel'),
                            '#2', '#2 Director'),
                          '#3', '#3 Spartacus'),
                        '#4', '#4 Nimrod'),
                      '#5', '#5 Sage'),
                    '#6', '#6 Courier'),
                  '#7', '#7 General'),
                '#8', '#8 Count Roth'),
              '#9', '#9 2Sun'),
            '#10', '#10 KnytRush'),
          '#11', '#11 Tyrantus'),
        '#12', '#12 Kn0w1')
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
                              REPLACE("KNYT-Cards-Owned", '#0', '#0 Deji'),
                              '#1', '#1 Sentinel'),
                            '#2', '#2 Director'),
                          '#3', '#3 Spartacus'),
                        '#4', '#4 Nimrod'),
                      '#5', '#5 Sage'),
                    '#6', '#6 Courier'),
                  '#7', '#7 General'),
                '#8', '#8 Count Roth'),
              '#9', '#9 2Sun'),
            '#10', '#10 KnytRush'),
          '#11', '#11 Tyrantus'),
        '#12', '#12 Kn0w1')
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
                              REPLACE("Characters-Owned", '#0', '#0 Deji'),
                              '#1', '#1 Sentinel'),
                            '#2', '#2 Director'),
                          '#3', '#3 Spartacus'),
                        '#4', '#4 Nimrod'),
                      '#5', '#5 Sage'),
                    '#6', '#6 Courier'),
                  '#7', '#7 General'),
                '#8', '#8 Count Roth'),
              '#9', '#9 2Sun'),
            '#10', '#10 KnytRush'),
          '#11', '#11 Tyrantus'),
        '#12', '#12 Kn0w1')
    ELSE "Characters-Owned"
  END
WHERE "KNYT-Posters-Owned" IS NOT NULL 
   OR "KNYT-Cards-Owned" IS NOT NULL 
   OR "Characters-Owned" IS NOT NULL;