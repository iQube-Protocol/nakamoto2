
import { ConnectionStatus } from './types';
import { GoogleApiLoader } from '../api/google-api-loader';

/**
 * Manages authentication with Google Drive
 */
export class AuthManager {
  private apiLoader: GoogleApiLoader;
  private isAuthenticated: boolean = false;
  private connectionStatus: ConnectionStatus = 'disconnected';
  
  constructor(apiLoader: GoogleApiLoader) {
    this.apiLoader = apiLoader;
    
    // Check if we already have a connection to Google Drive from localStorage
    if (typeof window !== 'undefined') {
      this.isAuthenticated = localStorage.getItem('gdrive-connected') === 'true';
      this.connectionStatus = this.isAuthenticated ? 'connected' : 'disconnected';
      console.log('AuthManager: Initial authentication state:', this.isAuthenticated);
    }
  }
  
  /**
   * Connect to Google Drive with auth flow
   */
  async connectToDrive(clientId: string, apiKey: string, cachedToken?: string | null): Promise<boolean> {
    // Implementation moved to DriveOperations class
    // This is a stub to maintain the API
    console.error('AuthManager: connectToDrive should be called from DriveOperations');
    return false;
  }
  
  /**
   * Verify connection is still valid
   */
  async verifyConnection(): Promise<boolean> {
    // Implementation moved to DriveOperations class
    // This is a stub to maintain the API
    return this.isAuthenticated;
  }
  
  /**
   * Check if connected to Google Drive
   */
  isConnectedToDrive(): boolean {
    return this.isAuthenticated;
  }
  
  /**
   * Get the current connection status
   */
  getConnectionStatus(): ConnectionStatus {
    return this.connectionStatus;
  }
  
  /**
   * Set authentication state
   */
  setAuthenticationState(state: boolean): void {
    this.isAuthenticated = state;
    this.connectionStatus = state ? 'connected' : 'disconnected';
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('gdrive-connected', state.toString());
      
      // If user is signing out, also clear the cached token
      if (!state) {
        localStorage.removeItem('gdrive-auth-token');
      }
    }
    
    console.log('AuthManager: Authentication state set to:', state);
  }
}
