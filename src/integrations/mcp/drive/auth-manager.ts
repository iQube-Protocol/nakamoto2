
import { toast } from 'sonner';
import { ConnectionStatus } from './types';
import { isAuthError, showConnectionToast } from './utils';

export class AuthManager {
  private isAuthenticated: boolean = false;
  private connectionStatus: ConnectionStatus = 'disconnected';
  private authToken: string | null = null;
  private apiLoader: any; // GoogleApiLoader
  private lastConnectionAttempt: number = 0;
  private connectionTimer: NodeJS.Timeout | null = null;

  constructor(apiLoader: any) {
    this.apiLoader = apiLoader;
    
    // Check if we already have a connection from localStorage
    if (typeof window !== 'undefined') {
      this.isAuthenticated = localStorage.getItem('gdrive-connected') === 'true';
      
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
        
        console.log('MCP: Drive connection state from localStorage:', this.isAuthenticated);
        this.connectionStatus = this.isAuthenticated ? 'connected' : 'disconnected';
      }
    }
  }

  /**
   * Connect to Google Drive and authorize access
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
    
    // Update connection status
    this.connectionStatus = 'connecting';
    
    console.log('MCP: Connecting to Google Drive with credentials:', { clientId, apiKeyLength: apiKey?.length });
    
    // Clean up any previous connection attempt
    if (this.connectionTimer) {
      clearTimeout(this.connectionTimer);
      this.connectionTimer = null;
    }
    
    if (!clientId || !apiKey) {
      toast.error('Missing Google API credentials', {
        description: 'Both Client ID and API Key are required',
        duration: 4000,
        id: 'drive-connect-error',
      });
      this.connectionStatus = 'error';
      return false;
    }
    
    try {
      showConnectionToast('loading');
      
      // Wait for API to be loaded with a proper timeout
      const apiLoaded = await this.apiLoader.ensureGoogleApiLoaded();
      if (!apiLoaded) {
        console.error('Google API failed to load');
        toast.error('Google API failed to load', {
          description: 'Please refresh the page and try again',
          duration: 4000,
          id: 'drive-connect-error',
        });
        this.connectionStatus = 'error';
        return false;
      }
      
      const gapi = this.apiLoader.getGapiClient();
      
      // Check if gapi is available
      if (!gapi || !gapi.client) {
        console.error('Google API client not available');
        toast.error('Google API client not available', {
          description: 'Please refresh the page and try again',
          duration: 4000,
          id: 'drive-connect-error',
        });
        this.connectionStatus = 'error';
        return false;
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
      
      // Initialize the Google API client with provided credentials
      try {
        await gapi.client.init({
          apiKey: apiKey,
          discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
        });
        console.log('MCP: Google API client initialized successfully');
      } catch (error) {
        console.error('Failed to initialize Google API client:', error);
        toast.error('Failed to initialize Google API client', {
          description: error instanceof Error ? error.message : 'Unknown error',
          duration: 4000,
          id: 'drive-connect-error',
        });
        
        // Clear timeout
        if (this.connectionTimer) {
          clearTimeout(this.connectionTimer);
          this.connectionTimer = null;
        }
        
        this.connectionStatus = 'error';
        return false;
      }
      
      // If we have a cached token, try to use it directly
      if (cachedToken) {
        try {
          console.log('MCP: Trying cached token');
          gapi.client.setToken(JSON.parse(cachedToken));
          this.authToken = cachedToken;
          
          showConnectionToast('verifying', 'Verifying saved credentials...');
          
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
            
            showConnectionToast('success', 'Connected to Google Drive');
            
            console.log('Successfully authenticated with Google Drive using cached token');
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
      
      // Create token client for OAuth 2.0 flow (only if cached token didn't work)
      const googleAccounts = (window as any).google?.accounts;
      if (!googleAccounts) {
        toast.error('Google Sign-In API not available', {
          description: 'Please check your internet connection and try again',
          duration: 4000,
          id: 'drive-connect-error',
        });
        
        // Clear timeout
        if (this.connectionTimer) {
          clearTimeout(this.connectionTimer);
          this.connectionTimer = null;
        }
        
        this.connectionStatus = 'error';
        return false;
      }
      
      showConnectionToast('connecting');
      
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
                
                showConnectionToast('verifying');
                
                // Verify the connection by making a test API call
                gapi.client.drive.files.list({
                  pageSize: 1,
                  fields: 'files(id)'
                })
                .then(() => {
                  console.log('MCP: Test API call successful, connection verified');
                  showConnectionToast('success');
                  resolve(true);
                })
                .catch(error => {
                  console.error('MCP: Test API call failed after authentication:', error);
                  
                  toast.dismiss('drive-connect');
                  toast.error('Authentication succeeded but API access failed', {
                    description: 'Please try again or check your Google Drive permissions',
                    duration: 4000,
                    id: 'drive-connect-error',
                  });
                  
                  this.isAuthenticated = false;
                  localStorage.setItem('gdrive-connected', 'false');
                  this.connectionStatus = 'error';
                  resolve(false);
                });
              } else {
                console.error('MCP: No access token received from Google OAuth');
                
                toast.dismiss('drive-connect');
                toast.error('Authentication failed', {
                  description: 'No access token received',
                  duration: 4000,
                  id: 'drive-connect-error',
                });
                
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
              
              toast.dismiss('drive-connect');
              toast.error('Google authentication failed', {
                description: error.message || 'Failed to authenticate with Google',
                duration: 4000,
                id: 'drive-connect-error',
              });
              
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
          
          toast.dismiss('drive-connect');
          toast.error('Google authentication failed', {
            description: e instanceof Error ? e.message : 'Failed to authenticate with Google',
            duration: 4000,
            id: 'drive-connect-error',
          });
          
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
      
      toast.dismiss('drive-connect');
      toast.error('Google Drive connection failed', { 
        description: error instanceof Error ? error.message : 'Unknown error',
        duration: 4000,
        id: 'drive-connect-error',
      });
      
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
    localStorage.setItem('gdrive-connected', state ? 'true' : 'false');
    this.connectionStatus = state ? 'connected' : 'disconnected';
    
    // If setting to false, also clear any cached auth token
    if (!state) {
      localStorage.removeItem('gdrive-auth-token');
      this.authToken = null;
    }
  }
}
