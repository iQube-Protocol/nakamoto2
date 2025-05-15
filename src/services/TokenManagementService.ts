
/**
 * Service for managing authentication tokens
 * Helps prevent token expiration issues by tracking expiry and refreshing
 */
export class TokenManagementService {
  private tokens: Map<string, {
    token: string;
    expiresAt: number;
    refreshCallback?: () => Promise<void>;
  }> = new Map();
  
  /**
   * Store a token with expiry time
   */
  storeToken(service: string, token: string, expiresInSeconds: number): void {
    // Calculate expiry time with a safety margin
    const expiresAt = Date.now() + (expiresInSeconds * 1000) - 60000; // 1 minute safety margin
    
    this.tokens.set(service, {
      token,
      expiresAt,
      refreshCallback: this.tokens.get(service)?.refreshCallback
    });
    
    console.log(`Stored ${service} token, expires in ${expiresInSeconds} seconds`);
  }
  
  /**
   * Get a stored token
   */
  getToken(service: string): string | null {
    const tokenData = this.tokens.get(service);
    if (!tokenData) return null;
    
    // If token is expired but we have a refresh callback, try to refresh
    if (!this.isTokenValid(service) && tokenData.refreshCallback) {
      console.log(`Token for ${service} is expired, attempting refresh`);
      // Execute refresh asynchronously, don't wait for it
      tokenData.refreshCallback().catch(error => {
        console.error(`Failed to refresh token for ${service}:`, error);
      });
      return null;
    }
    
    return tokenData.token;
  }
  
  /**
   * Check if a token is valid and not expired
   */
  isTokenValid(service: string): boolean {
    const tokenData = this.tokens.get(service);
    if (!tokenData) return false;
    
    const isValid = Date.now() < tokenData.expiresAt;
    
    if (!isValid) {
      console.log(`Token for ${service} is expired`);
    }
    
    return isValid;
  }
  
  /**
   * Register a callback to refresh the token when needed
   */
  registerRefreshCallback(service: string, refreshCallback: () => Promise<void>): void {
    const tokenData = this.tokens.get(service);
    
    this.tokens.set(service, {
      token: tokenData?.token || '',
      expiresAt: tokenData?.expiresAt || 0,
      refreshCallback
    });
    
    console.log(`Registered refresh callback for ${service}`);
  }
  
  /**
   * Remove a stored token
   */
  removeToken(service: string): void {
    this.tokens.delete(service);
    console.log(`Removed token for ${service}`);
  }
  
  /**
   * Clear all stored tokens
   */
  clearTokens(): void {
    this.tokens.clear();
    console.log('Cleared all tokens');
  }
}

// Create singleton instance
export const tokenManagementService = new TokenManagementService();
