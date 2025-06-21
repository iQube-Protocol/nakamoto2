
import { supabase } from '@/integrations/supabase/client';

export interface UnifiedInvitationStats {
  totalCreated: number;
  emailsSent: number;
  emailsPending: number;
  signupsCompleted: number;
  awaitingSignup: number;
  conversionRate: number;
  lastUpdated: string;
}

export interface BatchStatus {
  batchId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  totalEmails: number;
  emailsSent: number;
  emailsFailed: number;
  errors: string[];
}

class UnifiedInvitationService {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private CACHE_DURATION = 30000; // 30 seconds

  private isCacheValid(key: string): boolean {
    const cached = this.cache.get(key);
    if (!cached) return false;
    return Date.now() - cached.timestamp < this.CACHE_DURATION;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  private getCache(key: string): any {
    const cached = this.cache.get(key);
    return cached?.data;
  }

  async getUnifiedStats(forceRefresh: boolean = false): Promise<UnifiedInvitationStats> {
    const cacheKey = 'unified-stats';
    
    if (!forceRefresh && this.isCacheValid(cacheKey)) {
      return this.getCache(cacheKey);
    }

    console.log('UnifiedInvitationService: Fetching fresh stats...');
    
    try {
      // Get all invitation data in one query
      const { data: allInvitations, error } = await supabase
        .from('invited_users')
        .select('email_sent, signup_completed, invited_at')
        .order('invited_at', { ascending: false });

      if (error) {
        console.error('UnifiedInvitationService: Error fetching invitations:', error);
        throw error;
      }

      const totalCreated = allInvitations?.length || 0;
      const emailsSent = allInvitations?.filter(inv => inv.email_sent === true).length || 0;
      const emailsPending = allInvitations?.filter(inv => inv.email_sent === false).length || 0;
      const signupsCompleted = allInvitations?.filter(inv => inv.signup_completed === true).length || 0;
      const awaitingSignup = allInvitations?.filter(inv => inv.email_sent === true && inv.signup_completed === false).length || 0;
      const conversionRate = emailsSent > 0 ? (signupsCompleted / emailsSent) * 100 : 0;

      const stats: UnifiedInvitationStats = {
        totalCreated,
        emailsSent,
        emailsPending,
        signupsCompleted,
        awaitingSignup,
        conversionRate,
        lastUpdated: new Date().toISOString()
      };

      console.log('UnifiedInvitationService: Generated unified stats:', stats);
      this.setCache(cacheKey, stats);
      return stats;
    } catch (error) {
      console.error('UnifiedInvitationService: Failed to get unified stats:', error);
      throw new Error(`Failed to get invitation stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getBatchStatuses(): Promise<BatchStatus[]> {
    const cacheKey = 'batch-statuses';
    
    if (this.isCacheValid(cacheKey)) {
      return this.getCache(cacheKey);
    }

    try {
      const { data: batches, error } = await supabase
        .from('email_batches')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('UnifiedInvitationService: Error fetching batches:', error);
        throw error;
      }

      const batchStatuses: BatchStatus[] = (batches || []).map(batch => ({
        batchId: batch.batch_id,
        status: batch.status as 'pending' | 'in_progress' | 'completed' | 'failed',
        totalEmails: batch.total_emails,
        emailsSent: batch.emails_sent,
        emailsFailed: batch.emails_failed,
        errors: []
      }));

      this.setCache(cacheKey, batchStatuses);
      return batchStatuses;
    } catch (error) {
      console.error('UnifiedInvitationService: Failed to get batch statuses:', error);
      throw new Error(`Failed to get batch statuses: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async sendEmailBatch(emails: string[], batchSize: number = 100): Promise<{ success: boolean; batchId?: string; errors: string[] }> {
    console.log(`UnifiedInvitationService: Starting email batch send for ${emails.length} emails with batch size ${batchSize}`);
    
    try {
      // For large batches, split into smaller chunks
      if (emails.length > batchSize) {
        console.log(`UnifiedInvitationService: Splitting large batch of ${emails.length} into chunks of ${batchSize}`);
        
        const chunks = [];
        for (let i = 0; i < emails.length; i += batchSize) {
          chunks.push(emails.slice(i, i + batchSize));
        }

        const results = [];
        const errors: string[] = [];

        for (let i = 0; i < chunks.length; i++) {
          const chunk = chunks[i];
          console.log(`UnifiedInvitationService: Processing chunk ${i + 1}/${chunks.length} with ${chunk.length} emails`);
          
          try {
            const { data, error } = await supabase.functions.invoke('send-invitations', {
              body: { 
                emails: chunk, 
                testMode: false,
                batchId: `chunk_${Date.now()}_${i + 1}`
              }
            });

            if (error) {
              console.error(`UnifiedInvitationService: Chunk ${i + 1} failed:`, error);
              errors.push(`Chunk ${i + 1} failed: ${error.message}`);
            } else {
              console.log(`UnifiedInvitationService: Chunk ${i + 1} succeeded:`, data);
              results.push(data);
            }

            // Add delay between chunks to prevent overwhelming the system
            if (i < chunks.length - 1) {
              await new Promise(resolve => setTimeout(resolve, 2000));
            }
          } catch (chunkError: any) {
            console.error(`UnifiedInvitationService: Chunk ${i + 1} error:`, chunkError);
            errors.push(`Chunk ${i + 1} error: ${chunkError.message}`);
          }
        }

        const totalSent = results.reduce((sum, result) => sum + (result?.sent || 0), 0);
        console.log(`UnifiedInvitationService: Chunked batch complete. Total sent: ${totalSent}`);

        // Clear cache to force refresh
        this.cache.clear();

        return {
          success: totalSent > 0,
          errors: errors.length > 0 ? errors : [`Successfully sent ${totalSent} emails in ${chunks.length} chunks`]
        };
      } else {
        // Send small batch directly
        console.log(`UnifiedInvitationService: Sending small batch of ${emails.length} emails directly`);
        
        const { data, error } = await supabase.functions.invoke('send-invitations', {
          body: { 
            emails, 
            testMode: false,
            batchId: `direct_${Date.now()}`
          }
        });

        if (error) {
          console.error('UnifiedInvitationService: Direct batch failed:', error);
          throw error;
        }

        console.log('UnifiedInvitationService: Direct batch succeeded:', data);

        // Clear cache to force refresh
        this.cache.clear();

        return {
          success: data.success,
          batchId: data.batchId,
          errors: data.errors || []
        };
      }
    } catch (error: any) {
      console.error('UnifiedInvitationService: Batch send failed:', error);
      return {
        success: false,
        errors: [`Batch send failed: ${error.message}`]
      };
    }
  }

  clearCache(): void {
    console.log('UnifiedInvitationService: Clearing cache');
    this.cache.clear();
  }

  async validateDataConsistency(): Promise<{ isConsistent: boolean; issues: string[] }> {
    console.log('UnifiedInvitationService: Validating data consistency...');
    
    try {
      const [stats, batches] = await Promise.all([
        this.getUnifiedStats(true), // Force fresh data
        this.getBatchStatuses()
      ]);

      const issues: string[] = [];

      // Check if batch totals match invitation totals
      const totalBatchEmails = batches.reduce((sum, batch) => sum + batch.totalEmails, 0);
      const totalBatchSent = batches.reduce((sum, batch) => sum + batch.emailsSent, 0);

      if (totalBatchSent !== stats.emailsSent) {
        issues.push(`Batch emails sent (${totalBatchSent}) doesn't match invitation emails sent (${stats.emailsSent})`);
      }

      // Check for stuck batches
      const stuckBatches = batches.filter(batch => 
        batch.status === 'in_progress' || 
        (batch.status === 'pending' && Date.now() - new Date(batch.batchId.split('_')[1]).getTime() > 300000) // 5 minutes
      );

      if (stuckBatches.length > 0) {
        issues.push(`Found ${stuckBatches.length} stuck batches: ${stuckBatches.map(b => b.batchId).join(', ')}`);
      }

      console.log('UnifiedInvitationService: Data consistency check complete:', {
        isConsistent: issues.length === 0,
        issues
      });

      return {
        isConsistent: issues.length === 0,
        issues
      };
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
