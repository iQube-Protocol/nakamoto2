
import { toast } from 'sonner';

interface TokenInfo {
  token: string;
  expiry: number; // timestamp when token expires
  refreshInProgress: boolean;
}

/**
 * Service for enhanced token management with proactive refresh
 */
export class TokenManagementService {
  private tokenStore: Map<string, TokenInfo> = new Map();
  private refreshThresholdMs = 5 * 60 * 1000; // Refresh 5 minutes before expiry
  private refreshCallbacks: Map<string, (tokenClient: any) => Promise<void>> = new Map();
  
  /**
   * Register a callback to refresh a specific token type
   */
  registerRefreshCallback(tokenType: string, callback: (tokenClient: any) => Promise<void>): void {
    this.refreshCallbacks.set(tokenType, callback);
  }
  
  /**
   * Store token with expiry information
   */
  storeToken(tokenType: string, token: string, expiresInSeconds: number = 3600): void {
    const expiry = Date.now() + (expiresInSeconds * 1000);
    
    this.tokenStore.set(tokenType, {
      token,
      expiry,
      refreshInProgress: false
    });
    
    console.log(`Stored ${tokenType} token, expires in ${expiresInSeconds} seconds`);
    
    // Schedule refresh before expiry
    this.scheduleTokenRefresh(tokenType);
  }
  
  /**
   * Get token and refresh if needed
   */
  async getToken(tokenType: string, tokenClient: any): Promise<string | null> {
    const tokenInfo = this.tokenStore.get(tokenType);
    
    if (!tokenInfo) {
      console.log(`No ${tokenType} token found`);
      return null;
    }
    
    // Check if token is expired or close to expiry
    const now = Date.now();
    const shouldRefresh = tokenInfo.expiry - now < this.refreshThresholdMs;
    
    if (shouldRefresh && !tokenInfo.refreshInProgress) {
      console.log(`Token ${tokenType} needs refresh`);
      this.refreshToken(tokenType, tokenClient);
    }
    
    return tokenInfo.token;
  }
  
  /**
   * Check if token is valid
   */
  isTokenValid(tokenType: string): boolean {
    const tokenInfo = this.tokenStore.get(tokenType);
    if (!tokenInfo) return false;
    
    const now = Date.now();
    return tokenInfo.expiry > now;
  }
  
  /**
   * Schedule token refresh before expiry
   */
  private scheduleTokenRefresh(tokenType: string): void {
    const tokenInfo = this.tokenStore.get(tokenType);
    if (!tokenInfo) return;
    
    const now = Date.now();
    const timeToRefresh = Math.max(0, tokenInfo.expiry - this.refreshThresholdMs - now);
    
    console.log(`Scheduling ${tokenType} token refresh in ${timeToRefresh / 1000} seconds`);
    
    setTimeout(() => {
      const callback = this.refreshCallbacks.get(tokenType);
      if (callback) {
        this.refreshToken(tokenType, null);
      } else {
        console.warn(`No refresh callback registered for ${tokenType}`);
      }
    }, timeToRefresh);
  }
  
  /**
   * Refresh token using registered callback
   */
  private async refreshToken(tokenType: string, tokenClient: any): Promise<void> {
    const tokenInfo = this.tokenStore.get(tokenType);
    if (!tokenInfo || tokenInfo.refreshInProgress) return;
    
    // Mark refresh as in progress
    this.tokenStore.set(tokenType, {
      ...tokenInfo,
      refreshInProgress: true
    });
    
    try {
      console.log(`Refreshing ${tokenType} token...`);
      
      const callback = this.refreshCallbacks.get(tokenType);
      if (!callback) {
        console.error(`No refresh callback registered for ${tokenType}`);
        return;
      }
      
      await callback(tokenClient);
      console.log(`Successfully refreshed ${tokenType} token`);
    } catch (error) {
      console.error(`Error refreshing ${tokenType} token:`, error);
      toast.error(`Failed to refresh ${tokenType} credentials`, {
        description: 'You may need to reconnect the service'
      });
      
      // Update token info to no longer show refresh in progress
      const currentTokenInfo = this.tokenStore.get(tokenType);
      if (currentTokenInfo) {
        this.tokenStore.set(tokenType, {
          ...currentTokenInfo,
          refreshInProgress: false
        });
      }
    }
  }
  
  /**
   * Remove token
   */
  clearToken(tokenType: string): void {
    this.tokenStore.delete(tokenType);
    console.log(`Cleared ${tokenType} token`);
  }
}

// Singleton instance for global use
export const tokenManagementService = new TokenManagementService();
