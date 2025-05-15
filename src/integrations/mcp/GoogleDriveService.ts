import { toast } from 'sonner';
import { DocumentMetadata } from './types';
import { RetryService } from '@/services/RetryService';
import { documentValidationService } from '@/services/DocumentValidationService';
import { tokenManagementService } from '@/services/TokenManagementService';
import { driveProxyService } from './services/DriveProxyService';

/**
 * Service for Google Drive integration and document management
 */
export class GoogleDriveService {
  public gapi: any = null;
  private tokenClient: any = null;
  private isApiLoaded: boolean = false;
  private isAuthenticated: boolean = false;
  private retryService: RetryService;
  private useProxy: boolean = true; // Flag to use proxy service when available
  
  constructor() {
    console.log('Google Drive Service initialized');
    this.retryService = new RetryService({
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 8000,
      retryCondition: (error) => {
        // Only retry network/CORS/auth errors, not user errors
        return error && (
          error.toString().includes('Network Error') || 
          error.toString().includes('CORS') ||
          (error.status && (error.status === 401 || error.status === 403))
        );
      }
    });
    this.loadGoogleApi();
  }
  
  /**
   * Load Google API script dynamically
   */
  private loadGoogleApi(): void {
    if (typeof window !== 'undefined' && !this.isApiLoaded) {
      this.loadGapiScript();
      this.loadGsiScript();
    }
  }
  
  /**
   * Load the GAPI script
   */
  private loadGapiScript(): void {
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.onload = () => this.onGapiLoaded();
    document.body.appendChild(script);
  }
  
  /**
   * Load the GSI script
   */
  private loadGsiScript(): void {
    const gsiScript = document.createElement('script');
    gsiScript.src = 'https://accounts.google.com/gsi/client';
    document.body.appendChild(gsiScript);
  }
  
  /**
   * Callback when Google API script is loaded
   */
  private onGapiLoaded(): void {
    this.gapi = (window as any).gapi;
    this.gapi.load('client', () => {
      this.isApiLoaded = true;
      console.log('Google API client loaded');
    });
  }
  
  /**
   * Check if API is loaded with timeout and retries
   */
  private async waitForApiLoad(maxRetries: number = 5, retryDelay: number = 500): Promise<boolean> {
    let retries = 0;
    
    while (!this.isApiLoaded && retries < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      retries++;
    }
    
    return this.isApiLoaded;
  }

  /**
   * Verify and possibly refresh Google auth token
   */
  private async verifyAuthToken(): Promise<boolean> {
    if (!this.isAuthenticated || !this.gapi?.auth?.getToken()) {
      console.warn('Not authenticated or missing token');
      return false;
    }

    try {
      // Get the token
      const token = this.gapi.auth.getToken();
      if (!token || !token.access_token) {
        console.warn('No access token available');
        return false;
      }
      
      // Check if token is valid in our token service
      if (tokenManagementService.isTokenValid('google-drive')) {
        console.log('Token is valid according to token service');
        return true;
      }
      
      // Test if the token is valid with a connection test
      let isValid = false;
      
      if (this.useProxy) {
        // Test using proxy service
        try {
          isValid = await driveProxyService.testConnection(token.access_token);
        } catch (proxyError) {
          console.warn('Proxy connection test failed:', proxyError);
          // Fall back to direct test
          isValid = false;
        }
      }
      
      if (!isValid) {
        // Try direct API call if proxy failed or isn't used
        try {
          await this.gapi.client.drive.about.get({
            fields: 'user'
          });
          isValid = true;
        } catch (directError) {
          console.warn('Direct API token validation failed:', directError);
          isValid = false;
        }
      }
      
      if (isValid) {
        return true;
      }
      
      console.warn('Token validation failed, requesting new token');
      
      // If we have the token client, request a new token
      if (this.tokenClient) {
        try {
          await new Promise<void>((resolve, reject) => {
            const timeoutId = setTimeout(() => {
              reject(new Error('Token refresh timed out'));
            }, 10000); // 10 second timeout
            
            this.tokenClient.requestAccessToken({
              callback: (tokenResponse: any) => {
                clearTimeout(timeoutId);
                if (tokenResponse && tokenResponse.access_token) {
                  console.log('Token refreshed successfully');
                  
                  // Store token in token management service
                  if (tokenResponse.expires_in) {
                    tokenManagementService.storeToken(
                      'google-drive',
                      tokenResponse.access_token,
                      tokenResponse.expires_in
                    );
                  }
                  
                  resolve();
                } else {
                  reject(new Error('No token received during refresh'));
                }
              },
              error: (error: any) => {
                clearTimeout(timeoutId);
                reject(error);
              }
            });
          });
          return true;
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          return false;
        }
      }
      return false;
    } catch (error) {
      console.error('Error during token verification:', error);
      return false;
    }
  }
  
  /**
   * Connect to Google Drive and authorize access
   */
  async connectToDrive(clientId: string, apiKey: string): Promise<boolean> {
    console.log('Connecting to Google Drive with credentials:', { clientId, apiKeyLength: apiKey?.length });
    
    try {
      // Wait for API to load
      const apiLoaded = await this.waitForApiLoad();
      if (!apiLoaded) {
        throw new Error('Google API failed to load after multiple retries');
      }
      
      // Initialize the Google API client with provided credentials
      await this.gapi.client.init({
        apiKey: apiKey,
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
      });
      
      // Create token client for OAuth 2.0 flow
      this.tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'https://www.googleapis.com/auth/drive.readonly',
        callback: (tokenResponse: any) => {
          if (tokenResponse && tokenResponse.access_token) {
            this.isAuthenticated = true;
            localStorage.setItem('gdrive-connected', 'true');
            
            // Store token in token management service
            if (tokenResponse.expires_in) {
              tokenManagementService.storeToken(
                'google-drive',
                tokenResponse.access_token,
                tokenResponse.expires_in
              );
            }
            
            // Register refresh callback
            tokenManagementService.registerRefreshCallback(
              'google-drive',
              this.refreshToken.bind(this)
            );
            
            toast.success('Connected to Google Drive', {
              description: 'Your Google Drive documents are now available to the AI agents'
            });
            console.log('Successfully authenticated with Google Drive');
          }
        },
      });
      
      // Request access token
      this.tokenClient.requestAccessToken({prompt: ''});
      
      return true;
    } catch (error) {
      console.error('Error connecting to Google Drive:', error);
      toast.error('Google Drive connection failed', { 
        description: error instanceof Error ? error.message : 'Unknown error' 
      });
      return false;
    }
  }
  
  /**
   * Refresh token using token client
   */
  private async refreshToken(): Promise<void> {
    if (!this.tokenClient) {
      throw new Error('No token client available for refresh');
    }
    
    return new Promise<void>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('Token refresh timed out'));
      }, 10000); // 10 second timeout
      
      this.tokenClient.requestAccessToken({
        callback: (tokenResponse: any) => {
          clearTimeout(timeoutId);
          if (tokenResponse && tokenResponse.access_token) {
            console.log('Token refreshed successfully via callback');
            
            // Store token in token management service
            if (tokenResponse.expires_in) {
              tokenManagementService.storeToken(
                'google-drive',
                tokenResponse.access_token,
                tokenResponse.expires_in
              );
            }
            
            resolve();
          } else {
            reject(new Error('No token received during refresh'));
          }
        },
        error: (error: any) => {
          clearTimeout(timeoutId);
          reject(error);
        },
        prompt: ''  // Don't show UI for refresh
      });
    });
  }
  
  /**
   * Reset Google Drive connection
   */
  async resetDriveConnection(): Promise<boolean> {
    try {
      // Clear token info
      if (this.gapi && this.gapi.client) {
        console.log('Resetting Google Drive connection');
        this.gapi.client.setToken(null);
      }
      
      // Clear local storage
      localStorage.removeItem('gdrive-connected');
      
      // Reset authentication state
      this.isAuthenticated = false;
      
      // Remove stored token
      tokenManagementService.removeToken('google-drive');
      
      return true;
    } catch (error) {
      console.error('Error resetting Google Drive connection:', error);
      return false;
    }
  }
  
  /**
   * List documents and folders from Google Drive
   */
  async listDocuments(folderId?: string): Promise<DocumentMetadata[]> {
    try {
      await this.verifyAuthToken();
      
      // Try proxy first if available
      if (this.useProxy) {
        try {
          const token = this.gapi?.auth?.getToken()?.access_token;
          if (token) {
            const response = await driveProxyService.listFiles(token, folderId);
            if (response && response.files) {
              return response.files.map((file: any): DocumentMetadata => ({
                id: file.id,
                name: file.name,
                mimeType: file.mimeType,
                modifiedTime: file.modifiedTime
              }));
            }
          }
        } catch (proxyError) {
          console.warn('Proxy list documents failed:', proxyError);
          // Fall back to direct API
        }
      }
      
      // Direct API call
      const response = await this.retryService.execute(() => this.gapi.client.drive.files.list({
        q: folderId 
          ? `'${folderId}' in parents and trashed = false` 
          : `'root' in parents and trashed = false`,
        fields: 'files(id, name, mimeType, modifiedTime)'
      }));
      
      // Add type assertion to safely access result property
      const responseData = response as { result: { files: any[] } };
      
      return responseData.result.files.map((file: any): DocumentMetadata => ({
        id: file.id,
        name: file.name,
        mimeType: file.mimeType,
        modifiedTime: file.modifiedTime
      }));
    } catch (error) {
      console.error('Error listing documents:', error);
      throw error;
    }
  }
  
  /**
   * Fetch document content from Google Drive
   */
  async fetchDocumentContent(document: DocumentMetadata): Promise<string | null> {
    try {
      await this.verifyAuthToken();
      
      console.log(`Fetching content for document: ${document.name} (${document.mimeType})`);
      
      // Special handling for Google Docs, Sheets, etc.
      if (document.mimeType.includes('google-apps')) {
        return this.fetchGoogleWorkspaceDocument(document);
      } else {
        // Regular file download
        return this.fetchRegularDocument(document);
      }
    } catch (error) {
      console.error(`Error fetching document ${document.name}:`, error);
      throw error;
    }
  }
  
  /**
   * Fetch Google Workspace document (Docs, Sheets, etc.)
   */
  private async fetchGoogleWorkspaceDocument(document: DocumentMetadata): Promise<string | null> {
    // Determine export MIME type based on document type
    let exportMimeType = 'text/plain';
    
    if (document.mimeType.includes('spreadsheet')) {
      exportMimeType = 'text/csv';
    } else if (document.mimeType.includes('presentation')) {
      exportMimeType = 'text/plain';
    } else if (document.mimeType.includes('drawing')) {
      exportMimeType = 'application/pdf'; // Later we'll need to extract text from PDF
    }
    
    // Try proxy first for Google Workspace documents
    if (this.useProxy) {
      try {
        const token = this.gapi?.auth?.getToken()?.access_token;
        if (token) {
          const content = await driveProxyService.exportFile(token, document.id, exportMimeType);
          if (content) {
            return content;
          }
        }
      } catch (proxyError) {
        console.warn('Proxy export document failed:', proxyError);
        // Fall back to direct API
      }
    }
    
    try {
      const response = await this.retryService.execute(() => 
        this.gapi.client.drive.files.export({
          fileId: document.id, 
          mimeType: exportMimeType
        })
      );
      
      // Add type assertion for response
      const responseData = response as { body: string };
      return responseData.body;
    } catch (error) {
      console.error(`Error exporting Google Workspace document ${document.name}:`, error);
      throw error;
    }
  }
  
  /**
   * Fetch regular document content
   */
  private async fetchRegularDocument(document: DocumentMetadata): Promise<string | null> {
    // Try proxy first for regular documents
    if (this.useProxy) {
      try {
        const token = this.gapi?.auth?.getToken()?.access_token;
        if (token) {
          const content = await driveProxyService.downloadFile(token, document.id);
          if (content) {
            return content;
          }
        }
      } catch (proxyError) {
        console.warn('Proxy download document failed:', proxyError);
        // Fall back to direct API
      }
    }
    
    // Direct download
    try {
      const response = await this.retryService.execute(() => 
        this.gapi.client.drive.files.get({
          fileId: document.id,
          alt: 'media'
        })
      );
      
      // Add type assertion for response
      const responseData = response as { body: string };
      return responseData.body;
    } catch (error) {
      console.error(`Error downloading document ${document.name}:`, error);
      throw error;
    }
  }
}
