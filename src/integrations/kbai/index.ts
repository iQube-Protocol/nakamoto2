export * from './types';
export * from './KBAIMCPService';
export * from './KBAIDirectService';
export * from './fallbackItems';
export * from './services/KBAIErrorHandler';
export * from './services/KBAIItemTransformer';
export * from './services/KBAIRetryService';

// Import services
import { KBAIMCPService } from './KBAIMCPService';
import { KBAIDirectService } from './KBAIDirectService';

// Singleton instance for use throughout the app
let kbaiServiceInstance: KBAIMCPService | KBAIDirectService | null = null;

/**
 * Get the global KBAI service instance
 * Using direct API approach by default, instead of the edge function
 */
export const getKBAIService = (): KBAIMCPService | KBAIDirectService => {
  if (!kbaiServiceInstance) {
    // Use direct API connection instead of edge function
    kbaiServiceInstance = new KBAIDirectService();
    console.log('Created new KBAIDirectService instance for direct API connection');
  }
  return kbaiServiceInstance;
};

// For backward compatibility, keep the same method signatures
export * from './types';
