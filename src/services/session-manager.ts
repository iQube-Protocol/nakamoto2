
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { detectBrowser, getBraveCompatibilityInstructions } from '@/utils/browserDetection';

export class SessionManager {
  private static instance: SessionManager;
  private sessionCheckInterval: NodeJS.Timeout | null = null;
  private lastSessionCheck = 0;
  private readonly SESSION_CHECK_INTERVAL = 180000; // 3 minutes (reduced from 30s)
  private readonly SESSION_REFRESH_THRESHOLD = 300000; // 5 minutes
  private isValidating = false; // Prevent concurrent validations
  private validationCache: { session: Session | null; timestamp: number; isValid: boolean } | null = null;
  private readonly CACHE_DURATION = 60000; // 1 minute cache
  private retryCount = 0;
  private readonly MAX_RETRIES = 3;

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  /**
   * Smart session validation with caching and deduplication
   */
  async validateSession(): Promise<{ session: Session | null; isValid: boolean; error?: string }> {
    // Return cached result if still valid
    if (this.validationCache && (Date.now() - this.validationCache.timestamp) < this.CACHE_DURATION) {
      return {
        session: this.validationCache.session,
        isValid: this.validationCache.isValid
      };
    }

    // Prevent concurrent validations
    if (this.isValidating) {
      await new Promise(resolve => setTimeout(resolve, 100));
      return this.validateSession();
    }

    this.isValidating = true;

    try {
      console.log('🔐 SessionManager: Validating session (smart validation)...');
      
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('❌ SessionManager: Error getting session:', error);
        this.cacheValidationResult(null, false);
        this.handleSessionError(error);
        return { session: null, isValid: false, error: error.message };
      }

      if (!session) {
        console.warn('⚠️ SessionManager: No active session found');
        this.cacheValidationResult(null, false);
        return { session: null, isValid: false, error: 'No active session' };
      }

      // Check if session is close to expiring
      const expiresAt = session.expires_at ? session.expires_at * 1000 : 0;
      const now = Date.now();
      const timeUntilExpiry = expiresAt - now;

      if (timeUntilExpiry < this.SESSION_REFRESH_THRESHOLD) {
        console.log('🔄 SessionManager: Session close to expiry, attempting refresh...');
        
        const refreshResult = await this.refreshSessionWithRetry();
        
        if (!refreshResult.success) {
          this.cacheValidationResult(null, false);
          return { session: null, isValid: false, error: refreshResult.error };
        }

        this.cacheValidationResult(refreshResult.session, true);
        return { session: refreshResult.session, isValid: true };
      }

      console.log('✅ SessionManager: Session is valid (cached)');
      this.cacheValidationResult(session, true);
      this.retryCount = 0; // Reset retry count on success
      return { session, isValid: true };
    } catch (error) {
      console.error('❌ SessionManager: Unexpected error validating session:', error);
      this.cacheValidationResult(null, false);
      this.handleSessionError(error);
      return { session: null, isValid: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      this.isValidating = false;
    }
  }

  /**
   * Cache validation results to reduce API calls
   */
  private cacheValidationResult(session: Session | null, isValid: boolean): void {
    this.validationCache = {
      session,
      isValid,
      timestamp: Date.now()
    };
  }

  /**
   * Refresh session with exponential backoff retry
   */
  private async refreshSessionWithRetry(): Promise<{ success: boolean; session?: Session | null; error?: string }> {
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('❌ SessionManager: Error refreshing session:', error);
        
        if (this.retryCount < this.MAX_RETRIES) {
          this.retryCount++;
          const delay = Math.min(1000 * Math.pow(2, this.retryCount - 1), 10000);
          console.log(`🔄 SessionManager: Retrying refresh in ${delay}ms (attempt ${this.retryCount})`);
          
          await new Promise(resolve => setTimeout(resolve, delay));
          return this.refreshSessionWithRetry();
        }
        
        this.handleSessionError(error);
        return { success: false, error: error.message };
      }

      if (session) {
        console.log('✅ SessionManager: Session refreshed successfully');
        this.retryCount = 0;
        return { success: true, session };
      }

      return { success: false, error: 'No session returned from refresh' };
    } catch (error) {
      console.error('❌ SessionManager: Unexpected error refreshing session:', error);
      
      if (this.retryCount < this.MAX_RETRIES) {
        this.retryCount++;
        const delay = Math.min(1000 * Math.pow(2, this.retryCount - 1), 10000);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.refreshSessionWithRetry();
      }
      
      this.handleSessionError(error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Handle session errors with browser-specific guidance
   */
  private handleSessionError(error: any): void {
    const browserInfo = detectBrowser();
    
    if (browserInfo.isBrave) {
      console.warn('⚠️ SessionManager: Session error detected in Brave browser');
      
      toast.error('Authentication issue detected', {
        description: 'Brave browser may be blocking the session. Check the shield icon.',
        duration: 8000,
        action: {
          label: 'Instructions',
          onClick: () => this.showBraveInstructions()
        }
      });
    } else {
      toast.error('Session error', {
        description: 'Please try refreshing the page or signing in again.',
        duration: 5000
      });
    }
  }

  /**
   * Show Brave-specific instructions
   */
  private showBraveInstructions(): void {
    const instructions = getBraveCompatibilityInstructions();
    const message = instructions.join('\n• ');
    
    toast.info('Brave Browser Setup Required', {
      description: `To fix authentication issues:\n• ${message}`,
      duration: 15000
    });
  }

  /**
   * Start optimized session monitoring
   */
  startSessionMonitoring(): void {
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
    }

    // Only start monitoring if we have a session
    this.validateSession().then(({ isValid }) => {
      if (isValid) {
        this.sessionCheckInterval = setInterval(async () => {
          const now = Date.now();
          if (now - this.lastSessionCheck > this.SESSION_CHECK_INTERVAL) {
            this.lastSessionCheck = now;
            await this.validateSession();
          }
        }, this.SESSION_CHECK_INTERVAL);

        console.log('🔄 SessionManager: Started optimized session monitoring (3min intervals)');
      }
    });
  }

  /**
   * Stop session monitoring
   */
  stopSessionMonitoring(): void {
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
      this.sessionCheckInterval = null;
      console.log('⏹️ SessionManager: Stopped session monitoring');
    }
    // Clear cache when stopping
    this.validationCache = null;
    this.retryCount = 0;
  }

  /**
   * Force session refresh
   */
  async forceRefreshSession(): Promise<boolean> {
    console.log('🔄 SessionManager: Force refreshing session...');
    
    // Clear cache before forcing refresh
    this.validationCache = null;
    
    const result = await this.refreshSessionWithRetry();
    return result.success;
  }

  /**
   * Clear session cache (useful when user manually signs out)
   */
  clearCache(): void {
    this.validationCache = null;
    this.retryCount = 0;
  }
}

export const sessionManager = SessionManager.getInstance();
