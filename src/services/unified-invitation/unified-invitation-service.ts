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

    console.log('UnifiedInvitationService: Fetching fresh stats...');
    
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

  // New method: Get pending email send (emails that haven't been sent yet)
  async getPendingEmailSend(limit: number = 1000): Promise<PendingInvitation[]> {
    const cacheKey = `pending-emails-${limit}`;
    
    if (this.cacheManager.isCacheValid(cacheKey)) {
      return this.cacheManager.getCache(cacheKey);
    }

    console.log('UnifiedInvitationService: Fetching pending emails...');
    
    const { data, error } = await supabase
      .from('invited_users')
      .select('id, email, persona_type, invited_at, email_sent, email_sent_at, batch_id, send_attempts')
      .eq('email_sent', false)
      .order('invited_at', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('UnifiedInvitationService: Error fetching pending emails:', error);
      throw error;
    }

    const result = data || [];
    this.cacheManager.setCache(cacheKey, result);
    return result;
  }

  // New method: Get emails that have been sent
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
    this.cacheManager.setCache(cacheKey, result);
    return result;
  }

  // New method: Get users awaiting signup (email sent but not completed)
  async getAwaitingSignup(): Promise<PendingInvitation[]> {
    const cacheKey = 'awaiting-signup';
    
    if (this.cacheManager.isCacheValid(cacheKey)) {
      return this.cacheManager.getCache(cacheKey);
    }

    console.log('UnifiedInvitationService: Fetching awaiting signup...');
    
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
    this.cacheManager.setCache(cacheKey, result);
    return result;
  }

  // New method: Get completed invitations (signup completed)
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
    this.cacheManager.setCache(cacheKey, result);
    return result;
  }

  // New method: Get email batches
  async getEmailBatches(): Promise<EmailBatch[]> {
    const cacheKey = 'email-batches';
    
    if (this.cacheManager.isCacheValid(cacheKey)) {
      return this.cacheManager.getCache(cacheKey);
    }

    console.log('UnifiedInvitationService: Fetching email batches...');
    
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

    this.cacheManager.setCache(cacheKey, result);
    return result;
  }

  async sendEmailBatch(emails: string[], batchSize: number = 100): Promise<{ success: boolean; batchId?: string; errors: string[] }> {
    const result = await BatchManager.sendEmailBatch(emails, batchSize);
    
    // Clear cache to force refresh
    this.cacheManager.clearCache();
    
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
}

export const unifiedInvitationService = new UnifiedInvitationService();
