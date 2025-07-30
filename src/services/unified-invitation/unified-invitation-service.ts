
import { CacheManager } from './cache-manager';
import { StatsCalculator } from './stats-calculator';
import { BatchManager } from './batch-manager';
import { DataValidator } from './data-validator';
import { supabase } from '@/integrations/supabase/client';
import type { 
  UnifiedInvitationStats, 
  BatchStatus, 
  ValidationResult, 
  PendingInvitation, 
  EmailBatch 
} from './types';

class UnifiedInvitationService {
  private cacheManager = new CacheManager();

  async getUnifiedStats(forceRefresh: boolean = false): Promise<UnifiedInvitationStats> {
    const cacheKey = 'unified-stats';
    
    if (!forceRefresh && this.cacheManager.isCacheValid(cacheKey)) {
      return this.cacheManager.getCache(cacheKey);
    }

    console.log('UnifiedInvitationService: Fetching fresh stats with actual persona counts...');
    
    const stats = await StatsCalculator.calculateUnifiedStats();
    this.cacheManager.setCache(cacheKey, stats);
    return stats;
  }

  async getBatchStatuses(): Promise<BatchStatus[]> {
    const cacheKey = 'batch-statuses';
    
    if (this.cacheManager.isCacheValid(cacheKey)) {
      return this.cacheManager.getCache(cacheKey);
    }

    const batchStatuses = await BatchManager.getBatchStatuses();
    this.cacheManager.setCache(cacheKey, batchStatuses);
    return batchStatuses;
  }

  async getPendingEmailSend(limit: number = 50000): Promise<PendingInvitation[]> {
    const cacheKey = `pending-emails-${limit}`;
    
    if (this.cacheManager.isCacheValid(cacheKey)) {
      return this.cacheManager.getCache(cacheKey);
    }

    console.log(`UnifiedInvitationService: Fetching ALL pending emails (limit: ${limit})...`);
    
    // Get ALL pending emails (email_sent = false) with much higher limit
    const { data, error } = await supabase
      .from('invited_users')
      .select('id, email, persona_type, invited_at, email_sent, email_sent_at, batch_id, send_attempts, persona_data')
      .eq('email_sent', false)
      .eq('signup_completed', false)
      .order('invited_at', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('UnifiedInvitationService: Error fetching pending emails:', error);
      throw error;
    }

    const enrichedResult = (data || []).map(invitation => {
      const personaData = invitation.persona_data as Record<string, any> || {};
      return {
        ...invitation,
        persona_data: personaData,
        first_name: personaData['First-Name'] || '',
        last_name: personaData['Last-Name'] || '',
        full_name: `${personaData['First-Name'] || ''} ${personaData['Last-Name'] || ''}`.trim()
      };
    });
    console.log(`UnifiedInvitationService: Found ${enrichedResult.length} total pending emails`);
    this.cacheManager.setCache(cacheKey, enrichedResult);
    return enrichedResult;
  }

  async getEmailsSent(): Promise<PendingInvitation[]> {
    const cacheKey = 'emails-sent';
    
    if (this.cacheManager.isCacheValid(cacheKey)) {
      return this.cacheManager.getCache(cacheKey);
    }

    console.log('UnifiedInvitationService: Fetching ALL sent emails using batched approach...');
    
    const result = await this.fetchAllRecordsBatched(
      supabase
        .from('invited_users')
        .select('id, email, persona_type, invited_at, email_sent, email_sent_at, batch_id, send_attempts, persona_data')
        .eq('email_sent', true)
        .order('email_sent_at', { ascending: false })
    );

    // Extract names from persona_data for searching
    const enrichedResult = result.map(invitation => {
      const personaData = invitation.persona_data as Record<string, any> || {};
      return {
        ...invitation,
        persona_data: personaData,
        first_name: personaData['First-Name'] || '',
        last_name: personaData['Last-Name'] || '',
        full_name: `${personaData['First-Name'] || ''} ${personaData['Last-Name'] || ''}`.trim()
      };
    });

    console.log(`UnifiedInvitationService: Found ${enrichedResult.length} total sent emails via batching`);
    this.cacheManager.setCache(cacheKey, enrichedResult);
    return enrichedResult;
  }

  async getAwaitingSignup(): Promise<PendingInvitation[]> {
    const cacheKey = 'awaiting-signup';
    
    if (this.cacheManager.isCacheValid(cacheKey)) {
      return this.cacheManager.getCache(cacheKey);
    }

    console.log('UnifiedInvitationService: Fetching ALL awaiting signup using batched approach...');
    
    const result = await this.fetchAllRecordsBatched(
      supabase
        .from('invited_users')
        .select('id, email, persona_type, invited_at, email_sent, email_sent_at, batch_id, send_attempts, persona_data')
        .eq('email_sent', true)
        .eq('signup_completed', false)
        .order('email_sent_at', { ascending: false })
    );

    // Extract names from persona_data for searching
    const enrichedResult = result.map(invitation => {
      const personaData = invitation.persona_data as Record<string, any> || {};
      return {
        ...invitation,
        persona_data: personaData,
        first_name: personaData['First-Name'] || '',
        last_name: personaData['Last-Name'] || '',
        full_name: `${personaData['First-Name'] || ''} ${personaData['Last-Name'] || ''}`.trim()
      };
    });

    console.log(`UnifiedInvitationService: Found ${enrichedResult.length} total awaiting signup via batching`);
    this.cacheManager.setCache(cacheKey, enrichedResult);
    return enrichedResult;
  }

  async getCompletedInvitations(): Promise<PendingInvitation[]> {
    const cacheKey = 'completed-invitations';
    
    if (this.cacheManager.isCacheValid(cacheKey)) {
      return this.cacheManager.getCache(cacheKey);
    }

    console.log('UnifiedInvitationService: Fetching ALL completed invitations using batched approach...');
    
    const result = await this.fetchAllRecordsBatched(
      supabase
        .from('invited_users')
        .select('id, email, persona_type, invited_at, email_sent, email_sent_at, batch_id, send_attempts, persona_data')
        .eq('signup_completed', true)
        .order('completed_at', { ascending: false })
    );

    // Extract names from persona_data for searching
    const enrichedResult = result.map(invitation => {
      const personaData = invitation.persona_data as Record<string, any> || {};
      return {
        ...invitation,
        persona_data: personaData,
        first_name: personaData['First-Name'] || '',
        last_name: personaData['Last-Name'] || '',
        full_name: `${personaData['First-Name'] || ''} ${personaData['Last-Name'] || ''}`.trim()
      };
    });

    console.log(`UnifiedInvitationService: Found ${enrichedResult.length} total completed invitations via batching`);
    this.cacheManager.setCache(cacheKey, enrichedResult);
    return enrichedResult;
  }

  // Get ALL email batches without any limit
  async getEmailBatches(): Promise<EmailBatch[]> {
    const cacheKey = 'email-batches';
    
    if (this.cacheManager.isCacheValid(cacheKey)) {
      return this.cacheManager.getCache(cacheKey);
    }

    console.log('UnifiedInvitationService: Fetching ALL email batches...');
    
    // Fetch ALL batches without any limit
    const { data, error } = await supabase
      .from('email_batches')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('UnifiedInvitationService: Error fetching email batches:', error);
      throw error;
    }

    const result = (data || []).map(batch => ({
      id: batch.id,
      batch_id: batch.batch_id,
      total_emails: batch.total_emails,
      emails_sent: batch.emails_sent,
      emails_failed: batch.emails_failed,
      status: batch.status,
      created_at: batch.created_at,
      started_at: batch.started_at,
      completed_at: batch.completed_at
    }));

    console.log(`UnifiedInvitationService: Found ${result.length} total batches`);
    this.cacheManager.setCache(cacheKey, result);
    return result;
  }

  async sendEmailBatch(emails: string[], batchSize: number = 100): Promise<{ success: boolean; batchId?: string; errors: string[] }> {
    const result = await BatchManager.sendEmailBatch(emails, batchSize);
    
    // Force clear ALL cache to ensure fresh data
    this.clearCache();
    
    return result;
  }

  private async fetchAllRecordsBatched(query: any, batchSize: number = 1000): Promise<PendingInvitation[]> {
    const allRecords: PendingInvitation[] = [];
    let offset = 0;
    let hasMoreData = true;
    
    console.log('UnifiedInvitationService: Starting batched fetch with batch size:', batchSize);
    
    while (hasMoreData) {
      const { data, error } = await query
        .range(offset, offset + batchSize - 1);
      
      if (error) {
        console.error('Error in batched fetch:', error);
        throw error;
      }
      
      const batchData = data || [];
      console.log(`UnifiedInvitationService: Fetched batch ${Math.floor(offset / batchSize) + 1} with ${batchData.length} records`);
      
      allRecords.push(...batchData);
      
      // If we got less than the batch size, we've reached the end
      hasMoreData = batchData.length === batchSize;
      offset += batchSize;
      
      // Safety check to prevent infinite loops
      if (offset > 100000) {
        console.warn('UnifiedInvitationService: Safety limit reached, stopping batch fetch');
        break;
      }
    }
    
    console.log(`UnifiedInvitationService: Batched fetch completed with ${allRecords.length} total records`);
    return allRecords;
  }

  clearCache(): void {
    this.cacheManager.clearCache();
  }

  async validateDataConsistency(): Promise<ValidationResult> {
    console.log('UnifiedInvitationService: Validating data consistency...');
    
    try {
      const [stats, batches] = await Promise.all([
        this.getUnifiedStats(true), // Force fresh data
        this.getBatchStatuses()
      ]);

      return await DataValidator.validateDataConsistency(stats, batches);
    } catch (error: any) {
      console.error('UnifiedInvitationService: Validation failed:', error);
      return {
        isConsistent: false,
        issues: [`Validation failed: ${error.message}`]
      };
    }
  }

  // Force refresh all data
  async forceRefreshAllData(): Promise<void> {
    console.log('UnifiedInvitationService: Force refreshing ALL data...');
    
    // Clear all cache first
    this.clearCache();
    
    // Pre-load all data with fresh queries
    const [stats, pending, sent, awaiting, completed, batches] = await Promise.all([
      this.getUnifiedStats(true),
      this.getPendingEmailSend(50000),
      this.getEmailsSent(),
      this.getAwaitingSignup(),
      this.getCompletedInvitations(),
      this.getEmailBatches()
    ]);
    
    console.log('UnifiedInvitationService: Force refresh completed with counts:', {
      pending: pending.length,
      sent: sent.length,
      awaiting: awaiting.length,
      completed: completed.length,
      batches: batches.length
    });
    
    console.log('UnifiedInvitationService: All data refreshed successfully');
  }
}

export const unifiedInvitationService = new UnifiedInvitationService();
