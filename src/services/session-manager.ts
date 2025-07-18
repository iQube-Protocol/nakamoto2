
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { detectBrowser, getBraveCompatibilityInstructions } from '@/utils/browserDetection';

export class SessionManager {
  private static instance: SessionManager;
  private sessionCheckInterval: NodeJS.Timeout | null = null;
  private lastSessionCheck = 0;
  private readonly SESSION_CHECK_INTERVAL = 30000; // 30 seconds
  private readonly SESSION_REFRESH_THRESHOLD = 300000; // 5 minutes

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  /**
   * Validate current session and refresh if needed
   */
  async validateSession(): Promise<{ session: Session | null; isValid: boolean; error?: string }> {
    try {
      console.log('🔐 SessionManager: Validating current session...');
      
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('❌ SessionManager: Error getting session:', error);
        return { session: null, isValid: false, error: error.message };
      }

      if (!session) {
        console.warn('⚠️ SessionManager: No active session found');
        return { session: null, isValid: false, error: 'No active session' };
      }

      // Check if session is close to expiring
      const expiresAt = session.expires_at ? session.expires_at * 1000 : 0;
      const now = Date.now();
      const timeUntilExpiry = expiresAt - now;

      if (timeUntilExpiry < this.SESSION_REFRESH_THRESHOLD) {
        console.log('🔄 SessionManager: Session close to expiry, attempting refresh...');
        
        const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError) {
          console.error('❌ SessionManager: Error refreshing session:', refreshError);
          this.handleSessionError(refreshError);
          return { session: null, isValid: false, error: refreshError.message };
        }

        if (refreshedSession) {
          console.log('✅ SessionManager: Session refreshed successfully');
          return { session: refreshedSession, isValid: true };
        }
      }

      console.log('✅ SessionManager: Session is valid');
      return { session, isValid: true };
    } catch (error) {
      console.error('❌ SessionManager: Unexpected error validating session:', error);
      this.handleSessionError(error);
      return { session: null, isValid: false, error: error instanceof Error ? error.message : 'Unknown error' };
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
   * Start periodic session monitoring
   */
  startSessionMonitoring(): void {
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
    }

    this.sessionCheckInterval = setInterval(async () => {
      const now = Date.now();
      if (now - this.lastSessionCheck > this.SESSION_CHECK_INTERVAL) {
        this.lastSessionCheck = now;
        await this.validateSession();
      }
    }, this.SESSION_CHECK_INTERVAL);

    console.log('🔄 SessionManager: Started session monitoring');
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
  }

  /**
   * Force session refresh
   */
  async forceRefreshSession(): Promise<boolean> {
    try {
      console.log('🔄 SessionManager: Force refreshing session...');
      
      const { data: { session }, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('❌ SessionManager: Error force refreshing session:', error);
        this.handleSessionError(error);
        return false;
      }

      if (session) {
        console.log('✅ SessionManager: Session force refreshed successfully');
        return true;
      }

      return false;
    } catch (error) {
      console.error('❌ SessionManager: Unexpected error force refreshing session:', error);
      this.handleSessionError(error);
      return false;
    }
  }
}

export const sessionManager = SessionManager.getInstance();
