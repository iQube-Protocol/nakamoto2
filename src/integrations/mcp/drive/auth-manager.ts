
import { ConnectionStatus } from './types';
import { GoogleApiLoader } from '../api/google-api-loader';
import { toast } from 'sonner';

/**
 * Manages authentication with Google Drive
 */
export class AuthManager {
  private apiLoader: GoogleApiLoader;
  private isAuthenticated: boolean = false;
  private connectionStatus: ConnectionStatus = 'disconnected';
  private authToken: string | null = null;
  private lastConnectionAttempt: number = 0;
  private connectionTimer: NodeJS.Timeout | null = null;
  
  constructor(config: { apiLoader: GoogleApiLoader }) {
    this.apiLoader = config.apiLoader;
    
    // Check if we already have a connection to Google Drive from localStorage
    if (typeof window !== 'undefined') {
      this.isAuthenticated = localStorage.getItem('gdrive-connected') === 'true';
      this.connectionStatus = this.isAuthenticated ? 'connected' : 'disconnected';
      
      if (this.isAuthenticated) {
        // Load the cached token
        const cachedToken = localStorage.getItem('gdrive-auth-token');
        if (cachedToken) {
          try {
            this.authToken = cachedToken;
            console.log('MCP: Found cached auth token');
          } catch (e) {
            console.error('MCP: Error parsing cached token:', e);
            this.isAuthenticated = false;
          }
        }
      }
      
      console.log('AuthManager: Initial authentication state:', this.isAuthenticated);
    }
  }
  
  /**
   * Connect to Google Drive with auth flow
   */
  async connectToDrive(clientId: string, apiKey: string, cachedToken?: string | null): Promise<boolean> {
    // Prevent rapid reconnection attempts
    const now = Date.now();
    if (now - this.lastConnectionAttempt < 2000) {
      console.log('MCP: Throttling connection attempts');
      toast.info('Connection in progress, please wait', { duration: 2000 });
      return false;
    }
    this.lastConnectionAttempt = now;
    
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
      
      // Clean up any previous connection attempt
      if (this.connectionTimer) {
        clearTimeout(this.connectionTimer);
        this.connectionTimer = null;
      }
      
      // Set up connection timeout
      this.connectionTimer = setTimeout(() => {
        toast.dismiss('drive-connect');
        toast.error('Connection attempt timed out', {
          description: 'Please try again or refresh the page',
          duration: 4000,
          id: 'drive-connect-error',
        });
        this.connectionStatus = 'error';
      }, 45000);
      
      // If we have a cached token, try to use it directly
      if (cachedToken) {
        try {
          console.log('MCP: Trying cached token');
          gapi.client.setToken(JSON.parse(cachedToken));
          this.authToken = cachedToken;
          
          toast.loading('Verifying saved credentials...', { 
            id: 'drive-connect',
            duration: 10000 
          });
          
          // Test if the token is still valid with a simple API call
          try {
            const response = await gapi.client.drive.files.list({
              pageSize: 1,
              fields: 'files(id)'
            });
            
            // If we got here, the token is valid
            console.log('MCP: Successfully authenticated with Google Drive using cached token', response);
            
            // Clear timeout
            if (this.connectionTimer) {
              clearTimeout(this.connectionTimer);
              this.connectionTimer = null;
            }
            
            this.isAuthenticated = true;
            localStorage.setItem('gdrive-connected', 'true');
            this.connectionStatus = 'connected';
            
            return true;
          } catch (e) {
            // Token is invalid, proceed with normal flow
            console.log('Cached token is invalid, proceeding with regular auth flow');
            // Clear the invalid token
            localStorage.removeItem('gdrive-auth-token');
            gapi.client.setToken(null);
            this.authToken = null;
          }
        } catch (e) {
          console.error('Error parsing cached token:', e);
        }
      }
      
      // Initialize the Google API client with provided credentials
      try {
        await gapi.client.init({
          apiKey: apiKey,
          discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
        });
        console.log('MCP: Google API client initialized successfully');
      } catch (error) {
        console.error('Failed to initialize Google API client:', error);
        
        // Clear timeout
        if (this.connectionTimer) {
          clearTimeout(this.connectionTimer);
          this.connectionTimer = null;
        }
        
        this.connectionStatus = 'error';
        return false;
      }
      
      // Create token client for OAuth 2.0 flow
      const googleAccounts = (window as any).google?.accounts;
      if (!googleAccounts) {
        // Clear timeout
        if (this.connectionTimer) {
          clearTimeout(this.connectionTimer);
          this.connectionTimer = null;
        }
        
        this.connectionStatus = 'error';
        return false;
      }
      
      // Use a promise to track the OAuth flow with a timeout
      return new Promise((resolve) => {
        try {
          const tokenClient = googleAccounts.oauth2.initTokenClient({
            client_id: clientId,
            scope: 'https://www.googleapis.com/auth/drive.readonly',
            callback: (tokenResponse: any) => {
              // Clear connection timeout
              if (this.connectionTimer) {
                clearTimeout(this.connectionTimer);
                this.connectionTimer = null;
              }
              
              if (tokenResponse && tokenResponse.access_token) {
                console.log('MCP: Received access token from Google OAuth', tokenResponse);
                this.isAuthenticated = true;
                localStorage.setItem('gdrive-connected', 'true');
                this.connectionStatus = 'connected';
                
                // Cache the token
                try {
                  const currentToken = gapi.client.getToken();
                  console.log('MCP: Caching token to localStorage', currentToken);
                  const tokenStr = JSON.stringify(currentToken);
                  localStorage.setItem('gdrive-auth-token', tokenStr);
                  this.authToken = tokenStr;
                } catch (e) {
                  console.error('Failed to cache token:', e);
                }
                
                // Verify the connection by making a test API call
                gapi.client.drive.files.list({
                  pageSize: 1,
                  fields: 'files(id)'
                })
                .then(() => {
                  console.log('MCP: Test API call successful, connection verified');
                  resolve(true);
                })
                .catch(error => {
                  console.error('MCP: Test API call failed after authentication:', error);
                  this.isAuthenticated = false;
                  localStorage.setItem('gdrive-connected', 'false');
                  this.connectionStatus = 'error';
                  resolve(false);
                });
              } else {
                console.error('MCP: No access token received from Google OAuth');
                this.connectionStatus = 'error';
                resolve(false);
              }
            },
            error_callback: (error: any) => {
              // Clear connection timeout
              if (this.connectionTimer) {
                clearTimeout(this.connectionTimer);
                this.connectionTimer = null;
              }
              
              console.error('OAuth error:', error);
              this.connectionStatus = 'error';
              resolve(false);
            }
          });
          
          // Request access token
          console.log('MCP: Requesting OAuth token');
          tokenClient.requestAccessToken({ prompt: 'consent' });
        } catch (e) {
          // Clear connection timeout
          if (this.connectionTimer) {
            clearTimeout(this.connectionTimer);
            this.connectionTimer = null;
          }
          
          console.error('Error requesting access token:', e);
          this.connectionStatus = 'error';
          resolve(false);
        }
      });
    } catch (error) {
      console.error('MCP: Error connecting to Google Drive:', error);
      
      // Clear connection timeout
      if (this.connectionTimer) {
        clearTimeout(this.connectionTimer);
        this.connectionTimer = null;
      }
      
      this.connectionStatus = 'error';
      return false;
    }
  }

  /**
   * Verify that the connection to Drive is still valid
   */
  async verifyConnection(): Promise<boolean> {
    if (!this.isAuthenticated) return false;
    
    const gapi = this.apiLoader.getGapiClient();
    if (!gapi || !gapi.client) return false;
    
    try {
      // Make a lightweight API call to verify connection
      await gapi.client.drive.about.get({
        fields: 'user'
      });
      
      // If we get here, connection is valid
      return true;
    } catch (error) {
      console.warn('MCP: Connection verification failed, token may be invalid:', error);
      
      // If verification fails, try to use the cached token
      const cachedToken = localStorage.getItem('gdrive-auth-token');
      if (cachedToken && cachedToken !== this.authToken) {
        try {
          console.log('MCP: Trying to restore connection with cached token');
          gapi.client.setToken(JSON.parse(cachedToken));
          this.authToken = cachedToken;
          
          // Test the restored connection
          await gapi.client.drive.about.get({
            fields: 'user'
          });
          
          console.log('MCP: Connection restored with cached token');
          return true;
        } catch (e) {
          console.error('MCP: Failed to restore connection with cached token:', e);
          // Mark as disconnected
          this.setAuthenticationState(false);
          return false;
        }
      } else {
        // Mark as disconnected
        this.setAuthenticationState(false);
        return false;
      }
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
      
      // Attempt to sign out of Google Auth if available
      if (window.gapi?.auth2) {
        try {
          const authInstance = window.gapi.auth2.getAuthInstance?.();
          if (authInstance) {
            console.log('AuthManager: Signing out of Google Auth');
            authInstance.signOut?.().catch((e: any) => {
              console.warn('AuthManager: Error during Google Auth signout:', e);
            });
          }
        } catch (e) {
          console.warn('AuthManager: Error accessing auth instance during reset', e);
        }
      }
      
      // Disable auto select for Google Identity Services if available
      if (window.google?.accounts?.id) {
        try {
          console.log('AuthManager: Disabling Google Identity auto select');
          window.google.accounts.id.disableAutoSelect?.();
          window.google.accounts.id.cancel?.();
        } catch (e) {
          console.warn('AuthManager: Error disabling Google Identity auto select', e);
        }
      }
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
