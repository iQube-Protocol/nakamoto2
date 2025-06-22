
import type { UnifiedInvitationStats, BatchStatus, ValidationResult, DetailedValidationResult } from './types';
import { StatsCalculator } from './stats-calculator';

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
        (batch.status === 'pending' && batch.createdAt && 
         Date.now() - new Date(batch.createdAt).getTime() > 300000) // 5 minutes
      );

      if (stuckBatches.length > 0) {
        issues.push(`Found ${stuckBatches.length} stuck batches: ${stuckBatches.map(b => b.batchId).join(', ')}`);
      }

      // Check for mathematical inconsistencies
      if (stats.emailsSent + stats.emailsPending !== stats.totalCreated) {
        issues.push(`Math error: Sent (${stats.emailsSent}) + Pending (${stats.emailsPending}) ≠ Total (${stats.totalCreated})`);
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

  static async getDetailedValidation(): Promise<DetailedValidationResult> {
    console.log('DataValidator: Performing detailed validation...');
    
    try {
      return await StatsCalculator.validateDataConsistency();
    } catch (error: any) {
      console.error('DataValidator: Detailed validation failed:', error);
      return {
        isConsistent: false,
        issues: [`Detailed validation failed: ${error.message}`],
        detailedStats: {}
      };
    }
  }
}
