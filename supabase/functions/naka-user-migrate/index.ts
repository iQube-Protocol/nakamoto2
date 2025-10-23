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
  status: 'completed' | 'invited' | 'expired';
  persona_type: 'knyt' | 'qripto';
  invitation_status: {
    invited_at: string;
    invited_by: string | null;
    batch_id: string | null;
    email_sent: boolean;
    email_sent_at: string | null;
    send_attempts: number;
    expires_at: string;
    signup_completed: boolean;
    completed_at: string | null;
    invitation_token: string;
  };
  persona_data: Record<string, any>;
  connection_data: Array<{
    service: string;
    connected_at: string;
    connection_data: any;
  }>;
  name_preferences: {
    persona_type: string;
    name_source: string;
    invitation_first_name: string | null;
    invitation_last_name: string | null;
    linkedin_first_name?: string | null;
    linkedin_last_name?: string | null;
    custom_first_name?: string | null;
    custom_last_name?: string | null;
  } | null;
  profile: {
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
    total_points: number;
    level: number;
  } | null;
  auth_user_id: string | null;
  auth_created_at: string | null;
  meta: Record<string, any>;
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
          .schema('app_nakamoto')
          .from('user_migration_map')
          .select('*')
          .eq('source_email', user.email.toLowerCase())
          .eq('tenant_id', user.tenant_id)
          .maybeSingle();

        if (existing) {
          response.matched++;
          console.log(`User ${user.email} already migrated`);
          continue;
        }

        if (dry_run) {
          response.inserted++;
          console.log(`[DRY RUN] Would migrate user ${user.email} (${user.status})`);
          continue;
        }

        let authUserId = user.auth_user_id;

        // Handle completed users - create auth if not exists
        if (user.status === 'completed' && !authUserId) {
          // Check if auth user exists
          const { data: authUser } = await supabase.auth.admin.listUsers();
          const existingAuthUser = authUser.users.find(u => u.email === user.email);

          if (existingAuthUser) {
            authUserId = existingAuthUser.id;
          } else {
            // Create auth user with password reset requirement
            const { data: newUser, error: authError } = await supabase.auth.admin.createUser({
              email: user.email,
              email_confirm: true,
              user_metadata: {
                ...user.meta,
                persona_type: user.persona_type,
                migrated_from: 'nakamoto-aigent',
                requires_password_reset: true
              }
            });

            if (authError) {
              response.errors.push({ email: user.email, error: authError.message });
              console.error(`Auth error for ${user.email}:`, authError);
              continue;
            }

            authUserId = newUser.user.id;
            console.log(`Created auth user for ${user.email}`);
          }
        }

        // Insert into migration map with comprehensive data
        const { error: mapError } = await supabase
          .schema('app_nakamoto')
          .from('user_migration_map')
          .insert({
            source_user_id: user.source_user_id,
            source_email: user.email.toLowerCase(),
            tenant_id: user.tenant_id,
            auth_user_id: authUserId,
            status: user.status,
            persona_type: user.persona_type,
            invitation_status: user.invitation_status,
            persona_data: user.persona_data,
            connection_data: user.connection_data,
            name_preferences: user.name_preferences,
            profile_data: user.profile,
            meta: {
              ...user.meta,
              auth_created_at: user.auth_created_at,
              migrated_at: new Date().toISOString()
            },
            migrated_at: new Date().toISOString()
          });

        if (mapError) {
          response.errors.push({ email: user.email, error: mapError.message });
          console.error(`Map error for ${user.email}:`, mapError);
          continue;
        }

        response.inserted++;
        console.log(`Successfully migrated user ${user.email} (${user.status})`);

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
