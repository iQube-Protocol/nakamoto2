import { ConnectionStatus } from './types';
import { GoogleApiLoader } from '../api/google-api-loader';

/**
 * Manages authentication with Google Drive
 */
export class AuthManager {
  private apiLoader: GoogleApiLoader;
  private isAuthenticated: boolean = false;
  private connectionStatus: ConnectionStatus = 'disconnected';
  
  constructor(config: { apiLoader: GoogleApiLoader }) {
    this.apiLoader = config.apiLoader;
    
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
    try {
      // Ensure Google API is loaded and available
      if (!this.apiLoader.isLoaded()) {
        throw new Error('Google API not loaded');
      }
      
      // Access GAPI client
      const gapi = this.apiLoader.getGapiClient();
      if (!gapi) {
        throw new Error('Google API client not available');
      }
      
      // Initialize the client with API key
      await new Promise<void>((resolve, reject) => {
        try {
          gapi.setApiKey(apiKey);
          resolve();
        } catch (error) {
          reject(new Error(`Failed to set API key: ${error instanceof Error ? error.message : String(error)}`));
        }
      });
      
      // Initialize auth2 client with the OAuth client ID
      await new Promise<void>((resolve, reject) => {
        try {
          gapi.load('client:auth2', () => {
            gapi.client.init({
              clientId: clientId,
              scope: 'https://www.googleapis.com/auth/drive.readonly',
              discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest']
            })
            .then(() => {
              resolve();
            })
            .catch((error: any) => {
              reject(new Error(`Error initializing Google API client: ${error.message || String(error)}`));
            });
          });
        } catch (error) {
          reject(new Error(`Error loading Google API client:auth2: ${error instanceof Error ? error.message : String(error)}`));
        }
      });
      
      // Check if user is already signed in
      const isSignedIn = gapi.auth2?.getAuthInstance()?.isSignedIn?.get();
      
      // If not signed in, prompt user to sign in
      if (!isSignedIn) {
        await gapi.auth2.getAuthInstance().signIn();
      }
      
      // Update authentication state
      this.setAuthenticationState(true);
      
      // Cache the token in localStorage
      const authToken = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().id_token;
      if (typeof window !== 'undefined') {
        localStorage.setItem('gdrive-auth-token', authToken);
      }
      
      return true;
    } catch (error) {
      console.error('AuthManager: Failed to connect to Google Drive:', error);
      this.setAuthenticationState(false);
      return false;
    }
  }
  
  /**
   * Verify connection is still valid
   */
  async verifyConnection(): Promise<boolean> {
    if (!this.isAuthenticated) {
      return false;
    }
    
    try {
      // Get GAPI client
      const gapi = this.apiLoader.getGapiClient();
      if (!gapi) {
        console.warn('AuthManager: GAPI client not available for verification');
        return false;
      }
      
      // Check if auth2 is initialized
      if (!gapi.auth2 || !gapi.auth2.getAuthInstance) {
        console.warn('AuthManager: GAPI auth2 not initialized');
        return false;
      }
      
      // Check if signed in
      const isSignedIn = gapi.auth2.getAuthInstance().isSignedIn.get();
      
      // Update authentication state
      this.setAuthenticationState(isSignedIn);
      
      return isSignedIn;
    } catch (error) {
      console.error('AuthManager: Error verifying connection:', error);
      this.setAuthenticationState(false);
      return false;
    }
  }
  
  /**
   * Reset authentication state
   */
  resetAuth(): void {
    // Clear authentication state
    this.setAuthenticationState(false);
    
    // Clean up any cached tokens
    if (typeof window !== 'undefined') {
      localStorage.removeItem('gdrive-auth-token');
    }
    
    console.log('AuthManager: Authentication state reset');
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
