import { supabase } from '@/integrations/supabase/client';

/**
 * QubeBase Migration Service
 * Handles the migration of users, KB, and prompts to the QubeBase Core Hub
 */

export interface UserMigrationRecord {
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

export interface KBDocument {
  title: string;
  content_text?: string;
  source_uri?: string;
  lang?: string;
  tags?: string[];
  metadata?: any;
}

export interface InteractionHistory {
  source_user_id: string;
  query: string;
  response: string;
  interaction_type: string;
  metadata: any;
  summarized: boolean;
  created_at: string;
  persona_type?: 'knyt' | 'qripto';
}

export interface MigrationStats {
  users: {
    total: number;
    migrated: number;
    errors: number;
  };
  kb_docs: {
    total: number;
    imported: number;
    skipped: number;
    errors: number;
  };
  interactions: {
    total: number;
    migrated: number;
    errors: number;
  };
  prompt: {
    set: boolean;
    version?: number;
  };
}

/**
 * Migrate users in batches
 */
export async function migrateUsers(
  users: UserMigrationRecord[],
  dryRun = false
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    console.log(`Migrating ${users.length} users (dry_run: ${dryRun})`);

    const { data, error } = await supabase.functions.invoke('naka-user-migrate', {
      body: {
        users,
        dry_run: dryRun
      }
    });

    if (error) {
      console.error('User migration error:', error);
      return { success: false, error: error.message };
    }

    console.log('User migration result:', data);
    return { success: true, data };
  } catch (error: any) {
    console.error('User migration exception:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Import KB documents
 */
export async function importKBDocuments(
  documents: KBDocument[],
  dryRun = false
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    console.log(`Importing ${documents.length} KB documents (dry_run: ${dryRun})`);

    const { data, error } = await supabase.functions.invoke('naka-kb-import', {
      body: {
        documents,
        dry_run: dryRun
      }
    });

    if (error) {
      console.error('KB import error:', error);
      return { success: false, error: error.message };
    }

    console.log('KB import result:', data);
    return { success: true, data };
  } catch (error: any) {
    console.error('KB import exception:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Set root system prompt
 */
export async function setRootPrompt(
  promptText: string,
  metadata?: any
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    console.log('Setting root system prompt');

    const { data, error } = await supabase.functions.invoke('naka-prompt-set-root', {
      body: {
        prompt_text: promptText,
        metadata
      }
    });

    if (error) {
      console.error('Root prompt error:', error);
      return { success: false, error: error.message };
    }

    console.log('Root prompt result:', data);
    return { success: true, data };
  } catch (error: any) {
    console.error('Root prompt exception:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Upsert tenant-specific KB document
 */
export async function upsertTenantKBDoc(params: {
  tenant_id: string;
  title: string;
  content_text?: string;
  source_uri?: string;
  lang?: string;
  tags?: string[];
  metadata?: any;
}): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    console.log(`Upserting tenant KB doc: ${params.title}`);

    const { data, error } = await supabase.functions.invoke('naka-kb-upsert-tenant-doc', {
      body: params
    });

    if (error) {
      console.error('Tenant KB doc error:', error);
      return { success: false, error: error.message };
    }

    console.log('Tenant KB doc result:', data);
    return { success: true, data };
  } catch (error: any) {
    console.error('Tenant KB doc exception:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Set tenant prompt augmentation
 */
export async function setTenantPrompt(
  tenantId: string,
  promptText: string,
  metadata?: any
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    console.log(`Setting tenant prompt for: ${tenantId}`);

    const { data, error } = await supabase.functions.invoke('naka-prompt-set-tenant', {
      body: {
        tenant_id: tenantId,
        prompt_text: promptText,
        metadata
      }
    });

    if (error) {
      console.error('Tenant prompt error:', error);
      return { success: false, error: error.message };
    }

    console.log('Tenant prompt result:', data);
    return { success: true, data };
  } catch (error: any) {
    console.error('Tenant prompt exception:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Migrate interaction histories in batches
 */
export async function migrateInteractionHistories(
  interactions: InteractionHistory[],
  dryRun = false
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    console.log(`Migrating ${interactions.length} interaction histories (dry_run: ${dryRun})`);

    const { data, error } = await supabase.functions.invoke('naka-history-migrate', {
      body: {
        interactions,
        dry_run: dryRun
      }
    });

    if (error) {
      console.error('Interaction history migration error:', error);
      return { success: false, error: error.message };
    }

    console.log('Interaction history migration result:', data);
    return { success: true, data };
  } catch (error: any) {
    console.error('Interaction history migration exception:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get migration statistics from Core Hub (no localStorage fallbacks)
 */
export async function getMigrationStats(): Promise<MigrationStats> {
  try {
    // IMPORTANT: Query the actual Core Hub, not the Nakamoto instance
    // This requires using the Core Hub edge functions or direct Core Hub client
    
    console.warn('getMigrationStats: Cannot query Core Hub from client-side. Stats will be zero until edge functions return real counts.');
    
    // For now, return zeros - the UI should call edge functions to get real stats
    // TODO: Create a read-only edge function that queries Core Hub and returns stats
    return {
      users: { total: 0, migrated: 0, errors: 0 },
      kb_docs: { total: 0, imported: 0, skipped: 0, errors: 0 },
      interactions: { total: 0, migrated: 0, errors: 0 },
      prompt: { set: false }
    };
  } catch (error) {
    console.error('Error getting migration stats:', error);
    return {
      users: { total: 0, migrated: 0, errors: 0 },
      kb_docs: { total: 0, imported: 0, skipped: 0, errors: 0 },
      interactions: { total: 0, migrated: 0, errors: 0 },
      prompt: { set: false }
    };
  }
}

/**
 * Get effective KB documents (root + tenant)
 */
export async function getEffectiveKBDocs(tenantId?: string) {
  try {
    let query = (supabase as any)
      .from('kb.v_effective_docs')
      .select('*')
      .order('created_at', { ascending: false });

    // If tenant context is provided, filter appropriately
    if (tenantId) {
      query = query.or(`scope.eq.root,and(scope.eq.tenant,tenant_id.eq.${tenantId})`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching effective KB docs:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error: any) {
    console.error('Exception fetching effective KB docs:', error);
    return { data: null, error };
  }
}

/**
 * Get effective prompt (root + tenant augmentation)
 */
export async function getEffectivePrompt(tenantId?: string) {
  try {
    let query = (supabase as any)
      .from('prompts.v_effective_prompt')
      .select('effective_prompt')
      .eq('app', 'nakamoto');

    if (tenantId) {
      query = query.eq('tenant_id', tenantId);
    }

    const { data, error } = await query.single();

    if (error) {
      console.error('Error fetching effective prompt:', error);
      return { data: null, error };
    }

    return { data: data?.effective_prompt || '', error: null };
  } catch (error: any) {
    console.error('Exception fetching effective prompt:', error);
    return { data: null, error };
  }
}
