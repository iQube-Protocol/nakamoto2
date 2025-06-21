
import { CacheManager } from './cache-manager';
import { StatsCalculator } from './stats-calculator';
import { BatchManager } from './batch-manager';
import { DataValidator } from './data-validator';
import type { UnifiedInvitationStats, BatchStatus, ValidationResult } from './types';

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
