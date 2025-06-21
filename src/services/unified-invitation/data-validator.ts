
import type { UnifiedInvitationStats, BatchStatus, ValidationResult } from './types';

export class DataValidator {
  static async validateDataConsistency(stats: UnifiedInvitationStats, batches: BatchStatus[]): Promise<ValidationResult> {
    console.log('DataValidator: Validating data consistency...');
    
    try {
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

      console.log('DataValidator: Data consistency check complete:', {
        isConsistent: issues.length === 0,
        issues
      });

      return {
        isConsistent: issues.length === 0,
        issues
      };
    } catch (error: any) {
      console.error('DataValidator: Validation failed:', error);
      return {
        isConsistent: false,
        issues: [`Validation failed: ${error.message}`]
      };
    }
  }
}
