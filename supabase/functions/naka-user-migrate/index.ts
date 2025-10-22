import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UserMigrationRecord {
  source_user_id: string;
  email: string;
  tenant_id: string;
  status?: string;
  meta?: any;
}

interface MigrationResponse {
  inserted: number;
  matched: number;
  errors: Array<{ email: string; error: string }>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Use Core Hub credentials for migration
    const coreUrl = Deno.env.get('CORE_SUPABASE_URL')!;
    const coreServiceKey = Deno.env.get('CORE_SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(coreUrl, coreServiceKey);

    const { users, dry_run = false } = await req.json();
    
    if (!Array.isArray(users) || users.length === 0) {
      return new Response(
        JSON.stringify({ error: 'users array is required and must not be empty' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${users.length} users (dry_run: ${dry_run})`);

    const response: MigrationResponse = {
      inserted: 0,
      matched: 0,
      errors: []
    };

    for (const user of users as UserMigrationRecord[]) {
      try {
        // Check if user already migrated
        const { data: existing } = await supabase
          .from('app_nakamoto.user_migration_map')
          .select('*')
          .eq('source_email', user.email.toLowerCase())
          .eq('tenant_id', user.tenant_id)
          .single();

        if (existing) {
          response.matched++;
          console.log(`User ${user.email} already migrated`);
          continue;
        }

        if (dry_run) {
          response.inserted++;
          console.log(`[DRY RUN] Would insert user ${user.email}`);
          continue;
        }

        // Check if auth user exists
        const { data: authUser } = await supabase.auth.admin.listUsers();
        const existingAuthUser = authUser.users.find(u => u.email === user.email);

        let authUserId = existingAuthUser?.id;

        // If no auth user exists, we'll create one
        // NOTE: Password migration should be handled separately with actual password hashes
        if (!existingAuthUser) {
          const { data: newUser, error: authError } = await supabase.auth.admin.createUser({
            email: user.email,
            email_confirm: true,
            user_metadata: user.meta || {}
          });

          if (authError) {
            response.errors.push({ email: user.email, error: authError.message });
            console.error(`Auth error for ${user.email}:`, authError);
            continue;
          }

          authUserId = newUser.user.id;
          console.log(`Created auth user for ${user.email}`);
        }

        // Insert into migration map
        const { error: mapError } = await supabase
          .from('app_nakamoto.user_migration_map')
          .insert({
            source_user_id: user.source_user_id,
            source_email: user.email.toLowerCase(),
            tenant_id: user.tenant_id,
            auth_user_id: authUserId,
            status: user.status || 'active',
            meta: user.meta || {},
            migrated_at: new Date().toISOString()
          });

        if (mapError) {
          response.errors.push({ email: user.email, error: mapError.message });
          console.error(`Map error for ${user.email}:`, mapError);
          continue;
        }

        response.inserted++;
        console.log(`Successfully migrated user ${user.email}`);

      } catch (error: any) {
        response.errors.push({ 
          email: user.email, 
          error: error.message || 'Unknown error' 
        });
        console.error(`Error processing user ${user.email}:`, error);
      }
    }

    console.log('Migration complete:', response);

    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
