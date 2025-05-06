import { toast } from 'sonner';
import { GoogleApiLoader } from './api/google-api-loader';
import { ContextManager } from './context-manager';

/**
 * Manages operations with Google Drive
 */
export class DriveOperations {
  private apiLoader: GoogleApiLoader;
  private contextManager: ContextManager;
  private isAuthenticated: boolean = false;
  private connectionTimer: NodeJS.Timeout | null = null;
  private connectionCheckInterval: NodeJS.Timeout | null = null;
  private lastConnectionAttempt: number = 0;
  private authToken: string | null = null;
  private connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error' = 'disconnected';
  
  constructor(apiLoader: GoogleApiLoader, contextManager: ContextManager) {
    this.apiLoader = apiLoader;
    this.contextManager = contextManager;
    
    // Check if we already have a connection to Google Drive from localStorage
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
      
      // Set up connection state monitoring
      this.setupConnectionMonitoring();
    }
  }
  
  /**
   * Set up monitoring for connection state
   */
  private setupConnectionMonitoring(): void {
    // Clear any existing intervals
    if (this.connectionCheckInterval) {
      clearInterval(this.connectionCheckInterval);
    }
    
    // Set up interval to periodically verify connection
    this.connectionCheckInterval = setInterval(() => {
      // Only check if we think we're connected
      if (this.isAuthenticated) {
        this.verifyConnection().catch(err => {
          console.error('MCP: Connection verification failed:', err);
        });
      }
    }, 60000); // Check every minute
  }
  
  /**
   * Verify that the connection to Drive is still valid
   */
  private async verifyConnection(): Promise<boolean> {
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
   * Connect to Google Drive and authorize access with improved error handling and timeouts
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
      toast.loading('Setting up Google Drive connection...', {
        id: 'drive-connect',
        duration: 15000, // Short duration to prevent persistence
      });
      
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
            
            toast.dismiss('drive-connect');
            toast.success('Connected to Google Drive', {
              description: 'Using previously saved credentials',
              duration: 3000,
              id: 'drive-connect-success',
            });
            
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
      
      toast.loading('Waiting for Google authentication...', { 
        id: 'drive-connect',
        duration: 15000 
      });
      
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
                
                toast.loading('Verifying connection...', { 
                  id: 'drive-connect',
                  duration: 5000 
                });
                
                // Verify the connection by making a test API call
                gapi.client.drive.files.list({
                  pageSize: 1,
                  fields: 'files(id)'
                })
                .then(() => {
                  console.log('MCP: Test API call successful, connection verified');
                  
                  toast.dismiss('drive-connect');
                  toast.success('Connected to Google Drive', {
                    description: 'Your Google Drive documents are now available',
                    duration: 3000,
                    id: 'drive-connect-success',
                  });
                  
                  // Set up regular connection checks
                  this.setupConnectionMonitoring();
                  
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
   * Load document metadata from Google Drive with optimizations
   */
  async listDocuments(folderId?: string): Promise<any[]> {
    console.log(`MCP: Listing documents${folderId ? ' in folder ' + folderId : ''}`);
    
    if (!this.isAuthenticated) {
      console.error('MCP: Not authenticated with Google Drive');
      toast.error('Not connected to Google Drive', { 
        description: 'Please connect to Google Drive first',
        duration: 3000,
        id: 'drive-list-error',
      });
      return [];
    }
    
    // First verify the connection is still valid
    const isValid = await this.verifyConnection().catch(() => false);
    if (!isValid) {
      console.error('MCP: Connection is no longer valid');
      toast.error('Google Drive connection lost', {
        description: 'Please reconnect to Google Drive',
        duration: 3000,
        id: 'drive-list-error',
      });
      return [];
    }
    
    try {
      const gapi = this.apiLoader.getGapiClient();
      const query = folderId ? 
        `'${folderId}' in parents and trashed = false` : 
        `'root' in parents and trashed = false`;
      
      // Show a loading toast with a specific ID for folder operations
      toast.loading('Loading documents...', {
        id: 'drive-list',
        duration: 5000,
      });
      
      // Use batching for faster response
      const response = await gapi.client.drive.files.list({
        q: query,
        fields: 'files(id, name, mimeType, modifiedTime)',
        orderBy: 'modifiedTime desc',
        pageSize: 50,
        // Enable HTTP request batching
        supportsAllDrives: false
      });
      
      const files = response.result.files;
      console.log(`MCP: Found ${files.length} files in Google Drive`, files);
      
      // Dismiss the loading toast
      toast.dismiss('drive-list');
      
      return files;
    } catch (error) {
      console.error('MCP: Error listing documents from Google Drive:', error);
      
      // Dismiss the loading toast
      toast.dismiss('drive-list');
      
      toast.error('Failed to list documents', { 
        description: error instanceof Error ? error.message : 'Unknown error',
        duration: 4000,
        id: 'drive-list-error',
      });
      
      // Check if this is an authentication error and reset state if needed
      if (this.isAuthError(error)) {
        console.log('MCP: Authentication error detected, resetting connection state');
        this.setAuthenticationState(false);
      }
      
      return [];
    }
  }
  
  /**
   * Fetch a specific document and add its content to the context
   */
  async fetchDocumentContent(documentId: string): Promise<string | null> {
    console.log(`MCP: Fetching document content for ${documentId}`);
    
    if (!this.isAuthenticated) {
      console.error('MCP: Not authenticated with Google Drive');
      toast.error('Not connected to Google Drive', { 
        description: 'Please connect to Google Drive first',
        duration: 3000,
      });
      return null;
    }
    
    // Verify connection is still valid
    const isValid = await this.verifyConnection().catch(() => false);
    if (!isValid) {
      console.error('MCP: Connection is no longer valid');
      toast.error('Google Drive connection lost', {
        description: 'Please reconnect to Google Drive',
        duration: 3000,
      });
      return null;
    }
    
    try {
      const gapi = this.apiLoader.getGapiClient();
      
      // Show a loading toast
      toast.loading('Loading document content...', {
        id: `doc-${documentId}`,
        duration: 5000,
      });
      
      // First get the file metadata
      const fileMetadata = await gapi.client.drive.files.get({
        fileId: documentId,
        fields: 'name,mimeType'
      });
      
      const fileName = fileMetadata.result.name;
      const mimeType = fileMetadata.result.mimeType;
      
      // Handle different file types
      let documentContent = '';
      
      // For Google Docs, Sheets, and Slides, we need to export them in a readable format
      if (mimeType.includes('google-apps')) {
        const exportMimeType = this.getExportMimeType(mimeType);
        const exportResponse = await gapi.client.drive.files.export({
          fileId: documentId,
          mimeType: exportMimeType
        });
        
        documentContent = exportResponse.body;
      } else {
        // For other file types, use the files.get method with alt=media
        const response = await fetch(
          `https://www.googleapis.com/drive/v3/files/${documentId}?alt=media`,
          {
            headers: {
              'Authorization': `Bearer ${gapi.auth.getToken().access_token}`
            }
          }
        );
        
        // Check if response is ok and get content
        if (response.ok) {
          // For text-based files
          if (mimeType.includes('text') || mimeType.includes('json') || 
              mimeType.includes('javascript') || mimeType.includes('xml') ||
              mimeType.includes('html') || mimeType.includes('css')) {
            documentContent = await response.text();
          } else {
            // For binary files, we can only provide basic info
            documentContent = `This file (${fileName}) is a binary file of type ${mimeType} and cannot be displayed as text.`;
          }
        } else {
          throw new Error(`Failed to fetch file content: ${response.statusText}`);
        }
      }
      
      // Dismiss the loading toast
      toast.dismiss(`doc-${documentId}`);
      
      // Extract document type from mimeType
      const documentType = this.getDocumentType(mimeType);
      
      // Return the document content
      return documentContent;
    } catch (error) {
      console.error(`MCP: Error fetching document ${documentId}:`, error);
      
      // Dismiss the loading toast
      toast.dismiss(`doc-${documentId}`);
      
      toast.error('Failed to fetch document', { 
        description: error instanceof Error ? error.message : 'Unknown error',
        duration: 4000,
      });
      
      // Check if this is an authentication error and reset state if needed
      if (this.isAuthError(error)) {
        console.log('MCP: Authentication error detected, resetting connection state');
        this.setAuthenticationState(false);
      }
      
      return null;
    }
  }
  
  /**
   * Get the appropriate export MIME type for Google Workspace files
   */
  private getExportMimeType(originalMimeType: string): string {
    switch (originalMimeType) {
      case 'application/vnd.google-apps.document':
        return 'text/plain';
      case 'application/vnd.google-apps.spreadsheet':
        return 'text/csv';
      case 'application/vnd.google-apps.presentation':
        return 'text/plain';
      default:
        return 'text/plain';
    }
  }
  
  /**
   * Get simplified document type from MIME type
   */
  private getDocumentType(mimeType: string): string {
    if (mimeType.includes('pdf')) return 'pdf';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'doc';
    if (mimeType.includes('sheet') || mimeType.includes('excel') || mimeType.includes('csv')) return 'sheet';
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'slide';
    if (mimeType.includes('text') || mimeType.includes('txt')) return 'txt';
    if (mimeType.includes('image')) return 'image';
    if (mimeType.includes('audio')) return 'audio';
    if (mimeType.includes('video')) return 'video';
    return 'file';
  }
  
  /**
   * Check if an error is an authentication error
   */
  private isAuthError(error: any): boolean {
    if (!error) return false;
    
    // Check for common auth error patterns
    if (typeof error === 'object') {
      const errorStr = JSON.stringify(error).toLowerCase();
      return errorStr.includes('auth') && (
        errorStr.includes('unauthorized') ||
        errorStr.includes('unauthenticated') ||
        errorStr.includes('invalid') ||
        errorStr.includes('expired') ||
        errorStr.includes('revoked') ||
        errorStr.includes('permission')
      );
    }
    
    return false;
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
  getConnectionStatus(): 'disconnected' | 'connecting' | 'connected' | 'error' {
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
  
  /**
   * Clean up resources
   */
  cleanup(): void {
    // Clear any active timers
    if (this.connectionTimer) {
      clearTimeout(this.connectionTimer);
      this.connectionTimer = null;
    }
    
    if (this.connectionCheckInterval) {
      clearInterval(this.connectionCheckInterval);
      this.connectionCheckInterval = null;
    }
  }
}

/**
 * Factory function to create a new DriveOperations instance
 */
export function createDriveOperations(config: { apiLoader: GoogleApiLoader, contextManager: ContextManager }): DriveOperations {
  return new DriveOperations(config.apiLoader, config.contextManager);
}
