
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

  async getPendingEmailSend(limit: number = 10000): Promise<PendingInvitation[]> {
    const cacheKey = `pending-emails-${limit}`;
    
    if (this.cacheManager.isCacheValid(cacheKey)) {
      return this.cacheManager.getCache(cacheKey);
    }

    console.log('UnifiedInvitationService: Fetching pending emails...');
    
    // Get ALL pending emails (email_sent = false)
    const { data, error } = await supabase
      .from('invited_users')
      .select('id, email, persona_type, invited_at, email_sent, email_sent_at, batch_id, send_attempts')
      .eq('email_sent', false)
      .eq('signup_completed', false)
      .order('invited_at', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('UnifiedInvitationService: Error fetching pending emails:', error);
      throw error;
    }

    const result = data || [];
    console.log(`UnifiedInvitationService: Found ${result.length} pending emails`);
    this.cacheManager.setCache(cacheKey, result);
    return result;
  }

  async getEmailsSent(): Promise<PendingInvitation[]> {
    const cacheKey = 'emails-sent';
    
    if (this.cacheManager.isCacheValid(cacheKey)) {
      return this.cacheManager.getCache(cacheKey);
    }

    console.log('UnifiedInvitationService: Fetching sent emails...');
    
    const { data, error } = await supabase
      .from('invited_users')
      .select('id, email, persona_type, invited_at, email_sent, email_sent_at, batch_id, send_attempts')
      .eq('email_sent', true)
      .order('email_sent_at', { ascending: false });

    if (error) {
      console.error('UnifiedInvitationService: Error fetching sent emails:', error);
      throw error;
    }

    const result = data || [];
    console.log(`UnifiedInvitationService: Found ${result.length} sent emails`);
    this.cacheManager.setCache(cacheKey, result);
    return result;
  }

  async getAwaitingSignup(): Promise<PendingInvitation[]> {
    const cacheKey = 'awaiting-signup';
    
    if (this.cacheManager.isCacheValid(cacheKey)) {
      return this.cacheManager.getCache(cacheKey);
    }

    console.log('UnifiedInvitationService: Fetching awaiting signup...');
    
    // Get ALL users awaiting signup (email_sent = true, signup_completed = false)
    const { data, error } = await supabase
      .from('invited_users')
      .select('id, email, persona_type, invited_at, email_sent, email_sent_at, batch_id, send_attempts')
      .eq('email_sent', true)
      .eq('signup_completed', false)
      .order('email_sent_at', { ascending: false });

    if (error) {
      console.error('UnifiedInvitationService: Error fetching awaiting signup:', error);
      throw error;
    }

    const result = data || [];
    console.log(`UnifiedInvitationService: Found ${result.length} awaiting signup`);
    this.cacheManager.setCache(cacheKey, result);
    return result;
  }

  async getCompletedInvitations(): Promise<PendingInvitation[]> {
    const cacheKey = 'completed-invitations';
    
    if (this.cacheManager.isCacheValid(cacheKey)) {
      return this.cacheManager.getCache(cacheKey);
    }

    console.log('UnifiedInvitationService: Fetching completed invitations...');
    
    const { data, error } = await supabase
      .from('invited_users')
      .select('id, email, persona_type, invited_at, email_sent, email_sent_at, batch_id, send_attempts')
      .eq('signup_completed', true)
      .order('completed_at', { ascending: false });

    if (error) {
      console.error('UnifiedInvitationService: Error fetching completed invitations:', error);
      throw error;
    }

    const result = data || [];
    console.log(`UnifiedInvitationService: Found ${result.length} completed invitations`);
    this.cacheManager.setCache(cacheKey, result);
    return result;
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
    await Promise.all([
      this.getUnifiedStats(true),
      this.getPendingEmailSend(10000),
      this.getEmailsSent(),
      this.getAwaitingSignup(),
      this.getCompletedInvitations(),
      this.getEmailBatches()
    ]);
    
    console.log('UnifiedInvitationService: All data refreshed successfully');
  }
}

export const unifiedInvitationService = new UnifiedInvitationService();
