import { supabase } from '@/integrations/supabase/client';

/**
 * User Export Service
 * Handles comprehensive user data extraction for migration to QubeBase Core Hub
 */

export interface ExportedUser {
  // Invitation data
  invitation_id: string;
  email: string;
  persona_type: 'knyt' | 'qripto';
  invited_at: string;
  invited_by: string | null;
  batch_id: string | null;
  
  // Email tracking
  email_sent: boolean;
  email_sent_at: string | null;
  send_attempts: number;
  
  // Status tracking
  expires_at: string;
  signup_completed: boolean;
  completed_at: string | null;
  invitation_token: string;
  
  // Auth data (if completed)
  auth_user_id: string | null;
  auth_created_at: string | null;
  
  // Persona data (full)
  persona_data: Record<string, any>;
  
  // Connection data
  connections: Array<{
    service: string;
    connected_at: string;
    connection_data: any;
  }>;
  
  // Name preferences
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
  
  // Profile data
  profile: {
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
    total_points: number;
    level: number;
  } | null;
}

export interface UserMigrationStats {
  total: number;
  completed: number;
  pending: number;
  expired: number;
  by_persona_type: {
    knyt: number;
    qrypto: number;
  };
  by_batch: Record<string, number>;
  by_status: {
    active: number;
    invited: number;
    expired: number;
  };
}

export interface EnrichedUserMigrationRecord {
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

/**
 * Export all users with comprehensive data
 */
export async function exportAllUsers(): Promise<{ data: ExportedUser[] | null; error: string | null }> {
  try {
    console.log('Starting comprehensive user export...');

    // Get all invited users with pagination (PostgREST default limit = 1000)
    const pageSize = 1000;
    let from = 0;
    let page = 1;
    const allInvitations: any[] = [];
    let totalCount: number | null = null;

    while (true) {
      const { data, error, count } = await (supabase as any)
        .from('invited_users')
        .select('*', { count: 'exact' })
        .order('invited_at', { ascending: false })
        .range(from, from + pageSize - 1);

      if (error) {
        console.error(`Error fetching invitations page ${page}:`, error);
        return { data: null, error: error.message };
      }

      if (typeof count === 'number' && totalCount === null) totalCount = count;

      if (data?.length) {
        allInvitations.push(...data);
      }

      if (!data || data.length < pageSize) break;
      from += pageSize;
      page += 1;
    }

    if (allInvitations.length === 0) {
      return { data: [], error: null };
    }

    console.log(`Found ${allInvitations.length} invitation records${totalCount ? ` (total=${totalCount})` : ''}`);

    // Process each invitation and enrich with additional data
    const exportedUsers: ExportedUser[] = [];
    
    for (const invitation of allInvitations) {
      try {
        const enrichedUser: ExportedUser = {
          invitation_id: invitation.id,
          email: invitation.email,
          persona_type: invitation.persona_type as 'knyt' | 'qripto',
          invited_at: invitation.invited_at,
          invited_by: invitation.invited_by,
          batch_id: invitation.batch_id,
          email_sent: invitation.email_sent,
          email_sent_at: invitation.email_sent_at,
          send_attempts: invitation.send_attempts || 0,
          expires_at: invitation.expires_at,
          signup_completed: invitation.signup_completed,
          completed_at: invitation.completed_at,
          invitation_token: invitation.invitation_token,
          auth_user_id: null,
          auth_created_at: null,
          persona_data: (invitation.persona_data as Record<string, any>) || {},
          connections: [],
          name_preferences: null,
          profile: null
        };

        // If signup completed, enrich via persona and profile lookups without admin API
        if (invitation.signup_completed) {
          let foundUserId: string | null = null;

          try {
            if (invitation.persona_type === 'knyt') {
              const { data: personaRows } = await (supabase as any)
                .from('knyt_personas')
                .select('*')
                .eq('Email', invitation.email)
                .limit(1);
              const persona = personaRows?.[0];
              if (persona) {
                foundUserId = persona.user_id;
                enrichedUser.persona_data = { ...enrichedUser.persona_data, ...persona };
              }
            } else if (invitation.persona_type === 'qripto') {
              const { data: personaRows } = await supabase
                .from('qripto_personas')
                .select('*')
                .eq('Email', invitation.email)
                .limit(1);
              const persona = personaRows?.[0];
              if (persona) {
                foundUserId = persona.user_id;
                enrichedUser.persona_data = { ...enrichedUser.persona_data, ...persona };
              }
            }

            if (foundUserId) {
              enrichedUser.auth_user_id = foundUserId; // Use persona's user_id as linkage

              // Connections
              const { data: connections } = await (supabase as any)
                .from('user_connections')
                .select('*')
                .eq('user_id', foundUserId);
              if (connections) {
                enrichedUser.connections = connections.map((c: any) => ({
                  service: c.service,
                  connected_at: c.connected_at,
                  connection_data: c.connection_data
                }));
              }

              // Name preferences
              const { data: namePrefRows } = await supabase
                .from('user_name_preferences')
                .select('*')
                .eq('user_id', foundUserId)
                .eq('persona_type', invitation.persona_type)
                .limit(1);
              const namePrefs = namePrefRows?.[0];
              if (namePrefs) {
                enrichedUser.name_preferences = {
                  persona_type: namePrefs.persona_type,
                  name_source: namePrefs.name_source,
                  invitation_first_name: namePrefs.invitation_first_name,
                  invitation_last_name: namePrefs.invitation_last_name,
                  linkedin_first_name: namePrefs.linkedin_first_name,
                  linkedin_last_name: namePrefs.linkedin_last_name,
                  custom_first_name: namePrefs.custom_first_name,
                  custom_last_name: namePrefs.custom_last_name
                };
              }

              // Profile by user_id
              const { data: profileRows } = await supabase
                .from('profiles')
                .select('first_name, last_name, avatar_url, total_points, level')
                .eq('user_id', foundUserId)
                .limit(1);
              const profile = profileRows?.[0];
              if (profile) {
                enrichedUser.profile = {
                  first_name: profile.first_name,
                  last_name: profile.last_name,
                  avatar_url: profile.avatar_url,
                  total_points: profile.total_points || 0,
                  level: profile.level || 1
                };
              }
            }
          } catch (e) {
            console.warn('Enrichment lookup failed for', invitation.email, e);
          }
        }

        exportedUsers.push(enrichedUser);
      } catch (userError: any) {
        console.error(`Error processing user ${invitation.email}:`, userError);
        // Continue with other users
      }
    }

    console.log(`Exported ${exportedUsers.length} users with enriched data`);
    return { data: exportedUsers, error: null };

  } catch (error: any) {
    console.error('Error in exportAllUsers:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Export users by status
 */
export async function exportUsersByStatus(
  status: 'completed' | 'pending' | 'expired'
): Promise<{ data: ExportedUser[] | null; error: string | null }> {
  const { data: allUsers, error } = await exportAllUsers();
  
  if (error || !allUsers) {
    return { data: null, error };
  }

  const now = new Date();
  const filtered = allUsers.filter(user => {
    switch (status) {
      case 'completed':
        return user.signup_completed;
      case 'pending':
        return !user.signup_completed && new Date(user.expires_at) > now;
      case 'expired':
        return !user.signup_completed && new Date(user.expires_at) <= now;
      default:
        return false;
    }
  });

  return { data: filtered, error: null };
}

/**
 * Get user migration statistics
 */
export async function getUserMigrationStats(): Promise<UserMigrationStats> {
  try {
    const { data: allUsers, error } = await exportAllUsers();
    
    if (error || !allUsers) {
      return {
        total: 0,
        completed: 0,
        pending: 0,
        expired: 0,
        by_persona_type: { knyt: 0, qrypto: 0 },
        by_batch: {},
        by_status: { active: 0, invited: 0, expired: 0 }
      };
    }

    const now = new Date();
    const stats: UserMigrationStats = {
      total: allUsers.length,
      completed: 0,
      pending: 0,
      expired: 0,
      by_persona_type: { knyt: 0, qrypto: 0 },
      by_batch: {},
      by_status: { active: 0, invited: 0, expired: 0 }
    };

    for (const user of allUsers) {
      // Count by completion status
      if (user.signup_completed) {
        stats.completed++;
        stats.by_status.active++;
      } else if (new Date(user.expires_at) > now) {
        stats.pending++;
        stats.by_status.invited++;
      } else {
        stats.expired++;
        stats.by_status.expired++;
      }

      // Count by persona type
      if (user.persona_type === 'knyt') {
        stats.by_persona_type.knyt++;
      } else if (user.persona_type === 'qripto') {
        stats.by_persona_type.qrypto++;
      }

      // Count by batch
      if (user.batch_id) {
        stats.by_batch[user.batch_id] = (stats.by_batch[user.batch_id] || 0) + 1;
      }
    }

    return stats;
  } catch (error) {
    console.error('Error getting user migration stats:', error);
    return {
      total: 0,
      completed: 0,
      pending: 0,
      expired: 0,
      by_persona_type: { knyt: 0, qrypto: 0 },
      by_batch: {},
      by_status: { active: 0, invited: 0, expired: 0 }
    };
  }
}

/**
 * Convert ExportedUser to EnrichedUserMigrationRecord for migration
 */
export function convertToMigrationRecord(user: ExportedUser): EnrichedUserMigrationRecord {
  const now = new Date();
  const isExpired = new Date(user.expires_at) <= now;
  
  let status: 'completed' | 'invited' | 'expired';
  if (user.signup_completed) {
    status = 'completed';
  } else if (isExpired) {
    status = 'expired';
  } else {
    status = 'invited';
  }

  return {
    source_user_id: user.invitation_id,
    email: user.email,
    tenant_id: '00000000-0000-0000-0000-000000000000', // Nakamoto root tenant
    status,
    persona_type: user.persona_type,
    invitation_status: {
      invited_at: user.invited_at,
      invited_by: user.invited_by,
      batch_id: user.batch_id,
      email_sent: user.email_sent,
      email_sent_at: user.email_sent_at,
      send_attempts: user.send_attempts,
      expires_at: user.expires_at,
      signup_completed: user.signup_completed,
      completed_at: user.completed_at,
      invitation_token: user.invitation_token
    },
    persona_data: user.persona_data,
    connection_data: user.connections,
    name_preferences: user.name_preferences,
    profile: user.profile,
    auth_user_id: user.auth_user_id,
    auth_created_at: user.auth_created_at,
    meta: {
      exported_at: new Date().toISOString(),
      source_system: 'nakamoto-aigent'
    }
  };
}

/**
 * Export users for batch migration
 */
export async function exportUsersForMigration(
  statusFilter?: 'completed' | 'pending' | 'expired'
): Promise<{ data: EnrichedUserMigrationRecord[] | null; error: string | null }> {
  let usersResult;
  
  if (statusFilter) {
    usersResult = await exportUsersByStatus(statusFilter);
  } else {
    usersResult = await exportAllUsers();
  }

  if (usersResult.error || !usersResult.data) {
    return { data: null, error: usersResult.error };
  }

  const migrationRecords = usersResult.data.map(convertToMigrationRecord);
  return { data: migrationRecords, error: null };
}
