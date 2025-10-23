import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InteractionRecord {
  source_user_id: string;
  query: string;
  response: string;
  interaction_type: string;
  metadata: any;
  summarized: boolean;
  created_at: string;
  persona_type?: 'knyt' | 'qripto';
}

interface MigrationRequest {
  interactions: InteractionRecord[];
  dry_run?: boolean;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const coreSupabaseUrl = Deno.env.get('CORE_SUPABASE_URL');
    const coreServiceRoleKey = Deno.env.get('CORE_SUPABASE_SERVICE_ROLE_KEY');

    if (!coreSupabaseUrl || !coreServiceRoleKey) {
      throw new Error('Core Supabase credentials not configured');
    }

    const coreSupabase = createClient(coreSupabaseUrl, coreServiceRoleKey);

    const { interactions, dry_run = false }: MigrationRequest = await req.json();

    console.log(`Processing ${interactions.length} interaction records (dry_run: ${dry_run})`);

    const results = {
      inserted: 0,
      skipped: 0,
      errors: [] as any[],
    };

    for (const interaction of interactions) {
      try {
        // Look up the migrated user ID from the user_migration_map
        const { data: migrationMap, error: mapError } = await coreSupabase
          .from('app_nakamoto.user_migration_map')
          .select('new_user_id, tenant_id')
          .eq('source_user_id', interaction.source_user_id)
          .single();

        if (mapError || !migrationMap) {
          console.warn(`No migration map found for user ${interaction.source_user_id}, skipping interaction`);
          results.skipped++;
          continue;
        }

        if (dry_run) {
          console.log('DRY RUN - Would migrate interaction:', {
            source_user_id: interaction.source_user_id,
            new_user_id: migrationMap.new_user_id,
            tenant_id: migrationMap.tenant_id,
            interaction_type: interaction.interaction_type,
            persona_type: interaction.persona_type,
            created_at: interaction.created_at,
          });
          results.inserted++;
          continue;
        }

        // Prepare the interaction history record for QubeBase
        const historyRecord = {
          app: 'nakamoto',
          tenant_id: migrationMap.tenant_id,
          user_id: migrationMap.new_user_id,
          query_text: interaction.query,
          response_text: interaction.response,
          interaction_type: interaction.interaction_type,
          persona_type: interaction.persona_type || null,
          summarized: interaction.summarized,
          source_metadata: {
            ...interaction.metadata,
            source_user_id: interaction.source_user_id,
            migrated_at: new Date().toISOString(),
          },
          occurred_at: interaction.created_at,
          created_at: interaction.created_at,
        };

        // Insert into app_nakamoto.interaction_history
        const { error: insertError } = await coreSupabase
          .from('app_nakamoto.interaction_history')
          .insert(historyRecord);

        if (insertError) {
          console.error(`Failed to insert interaction for user ${interaction.source_user_id}:`, insertError);
          results.errors.push({
            source_user_id: interaction.source_user_id,
            error: insertError.message,
          });
        } else {
          results.inserted++;
        }
      } catch (error: any) {
        console.error(`Error processing interaction for user ${interaction.source_user_id}:`, error);
        results.errors.push({
          source_user_id: interaction.source_user_id,
          error: error.message,
        });
      }
    }

    console.log('Interaction migration complete:', results);

    return new Response(
      JSON.stringify(results),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Interaction migration error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
