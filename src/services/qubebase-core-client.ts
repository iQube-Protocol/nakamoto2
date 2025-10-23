import { createClient } from '@supabase/supabase-js';

/**
 * QubeBase Core Hub Client
 * Direct connection to the Core Hub for migration and cross-instance operations
 * 
 * NOTE: This is separate from the main Nakamoto client and should ONLY be used for:
 * - Migration operations
 * - Tenant management
 * - Cross-instance data access
 */

// Core Hub connection (read-only for client-side)
const CORE_HUB_URL = 'https://bsjhfvctmduxhohtllly.supabase.co';
const CORE_HUB_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzamhmdmN0bWR1eGhvaHRsbGx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NDgyNTgsImV4cCI6MjA3MzEyNDI1OH0.JVDp4-F6EEXqVQ8sts2Z8KQg168aZ1YdtY53RRM_s7M';

export const coreHubClient = createClient(CORE_HUB_URL, CORE_HUB_ANON_KEY, {
  db: { schema: 'kb' }
});

/**
 * Get current tenant context from localStorage
 */
export function getTenantContext(): { tenantId: string; siteId: string } {
  return {
    tenantId: localStorage.getItem('tenantId') || '00000000-0000-0000-0000-000000000000',
    siteId: localStorage.getItem('siteId') || ''
  };
}

/**
 * Set tenant context in localStorage
 */
export function setTenantContext(tenantId: string, siteId: string) {
  localStorage.setItem('tenantId', tenantId);
  localStorage.setItem('siteId', siteId);
}

/**
 * Query Core Hub with automatic tenant scoping
 */
export async function queryCoreHub<T = any>(
  table: string,
  options?: {
    select?: string;
    filter?: Record<string, any>;
    scopeToTenant?: boolean;
  }
) {
  const { tenantId } = getTenantContext();
  let query = coreHubClient.from(table).select(options?.select || '*');

  // Apply filters
  if (options?.filter) {
    Object.entries(options.filter).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
  }

  // Auto-scope to tenant if enabled
  if (options?.scopeToTenant && tenantId) {
    query = query.eq('tenant_id', tenantId);
  }

  return query;
}

/**
 * Health check for Core Hub connection
 */
export async function checkCoreHubHealth(): Promise<{ connected: boolean; error?: string; details?: any }> {
  try {
    console.log('🔍 Testing Core Hub connection to:', CORE_HUB_URL);
    
    // First try basic connection - query any public table or use a simpler endpoint
    const { data, error } = await coreHubClient
      .from('corpora')
      .select('id')
      .limit(1);

    console.log('Core Hub query result:', { data, error });

    if (error) {
      // Check if it's a "table doesn't exist" error
      if (error.code === '42P01' || error.message.includes('does not exist')) {
        return { 
          connected: true, // Connection works, but schema not set up
          error: 'Core Hub connected, but kb.corpora table not found. QubeBase schema needs to be initialized.',
          details: { 
            code: error.code,
            message: error.message,
            hint: 'Run the QubeBase schema migration on the Core Hub first'
          }
        };
      }
      
      // Other errors (permissions, network, etc.)
      return { 
        connected: false, 
        error: error.message,
        details: { code: error.code, hint: error.hint }
      };
    }

    // Success
    return { connected: true };
  } catch (error: any) {
    console.error('Core Hub health check exception:', error);
    return { 
      connected: false, 
      error: error.message || 'Unknown connection error',
      details: error
    };
  }
}
