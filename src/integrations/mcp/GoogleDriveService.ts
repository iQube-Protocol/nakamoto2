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
  private async refreshToken(tokenClient: any): Promise<void> {
    if (!tokenClient && !this.tokenClient) {
      throw new Error('No token client available for refresh');
    }
    
    const client = tokenClient || this.tokenClient;
    
    return new Promise<void>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('Token refresh timed out'));
      }, 10000); // 10 second timeout
      
      client.requestAccessToken({
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
        }
      });
    });
  }
  
  /**
   * Reset Google Drive connection
   */
  async resetDriveConnection(): Promise<boolean> {
    console.log('Resetting Google Drive connection');
    
    try {
      // Clear any cached tokens from Google Auth
      if (this.gapi && this.gapi.auth) {
        try {
          // Try to clear the token
          const token = this.gapi.auth.getToken();
          if (token) {
            this.gapi.auth.setToken(null);
            console.log('Successfully cleared auth token');
          }
        } catch (e) {
          console.log('No token to clear or error clearing token', e);
        }
      }

      // Reset authentication state
      this.isAuthenticated = false;
      
      // Clear token in token management service
      tokenManagementService.clearToken('google-drive');
      
      // Reset stored credentials in localStorage
      localStorage.removeItem('gdrive-connected');
      
      // Create new token client for future authentication
      if ((window as any).google && (window as any).google.accounts && (window as any).google.accounts.oauth2) {
        this.tokenClient = null;
      }
      
      console.log('Google Drive connection has been reset');
      return true;
    } catch (error) {
      console.error('Error resetting Drive connection:', error);
      throw error;
    }
  }
  
  /**
   * Load document metadata from Google Drive
   */
  async listDocuments(folderId?: string): Promise<DocumentMetadata[]> {
    console.log(`Listing documents${folderId ? ' in folder ' + folderId : ''}`);
    
    if (!this.isAuthenticated) {
      console.error('Not authenticated with Google Drive');
      toast.error('Not connected to Google Drive', { 
        description: 'Please connect to Google Drive first' 
      });
      return [];
    }
    
    try {
      // Verify authentication token before proceeding
      await this.verifyAuthToken();
      
      // Try to use proxy service first
      if (this.useProxy) {
        try {
          const token = this.gapi.auth.getToken().access_token;
          const result = await driveProxyService.listFiles(token, folderId);
          
          if (result && result.files) {
            console.log(`Found ${result.files.length} files via proxy`);
            return result.files;
          } else {
            console.warn('Proxy returned invalid response format, falling back to direct API');
          }
        } catch (proxyError) {
          console.error('Error using proxy for listing documents:', proxyError);
          console.log('Falling back to direct API call');
          // Continue to direct API call
        }
      }
      
      // Direct API call as fallback
      const query = folderId ? 
        `'${folderId}' in parents and trashed = false` : 
        `'root' in parents and trashed = false`;
      
      const response = await this.gapi.client.drive.files.list({
        q: query,
        fields: 'files(id, name, mimeType, modifiedTime)',
        orderBy: 'modifiedTime desc',
        pageSize: 50
      });
      
      const files = response.result.files;
      console.log(`Found ${files.length} files in Google Drive`, files);
      return files;
    } catch (error) {
      console.error('Error listing documents from Google Drive:', error);
      toast.error('Failed to list documents', { 
        description: error instanceof Error ? error.message : 'Unknown error' 
      });
      return [];
    }
  }
  
  /**
   * Fetch a specific document's content with retry
   */
  async fetchDocumentContent(document: DocumentMetadata): Promise<string | null> {
    const documentId = document.id;
    const fileName = document.name;
    const mimeType = document.mimeType;
    
    console.log(`Fetching document content for ${documentId} (${fileName})`);
    
    if (!this.isAuthenticated) {
      console.error('Not authenticated with Google Drive');
      toast.error('Not connected to Google Drive', { 
        description: 'Please connect to Google Drive first' 
      });
      return null;
    }
    
    try {
      // First verify token validity
      const validToken = await this.verifyAuthToken();
      if (!validToken) {
        throw new Error('Authentication token is invalid or expired');
      }
      
      const token = this.gapi.auth.getToken().access_token;
      
      return await this.retryService.execute(async () => {
        let documentContent = '';
        
        // For Google Docs, Sheets, and Slides, use export method
        if (mimeType.includes('google-apps')) {
          console.log(`Exporting Google document: ${fileName}`);
          const exportMimeType = this.getExportMimeType(mimeType);
          
          try {
            // Try using proxy first
            if (this.useProxy) {
              try {
                documentContent = await driveProxyService.exportFile(
                  token, 
                  documentId, 
                  exportMimeType
                );
                
                console.log(`Successfully exported Google document via proxy: ${fileName}`);
              } catch (proxyError) {
                console.warn('Proxy export failed, falling back to direct API:', proxyError);
                // Fall back to direct API
                documentContent = '';
              }
            }
            
            // If proxy failed or not used, try direct API
            if (!documentContent) {
              const exportResponse = await this.gapi.client.drive.files.export({
                fileId: documentId,
                mimeType: exportMimeType
              });
              
              if (!exportResponse || !exportResponse.body) {
                throw new Error(`No content received for Google document ${fileName}`);
              }
              
              documentContent = exportResponse.body;
            }
            
            console.log(`Successfully exported Google document: ${fileName}, content length: ${documentContent.length}`);
          } catch (exportError) {
            console.error(`Error exporting Google document ${fileName}:`, exportError);
            throw new Error(`Failed to export Google document: ${exportError.message || 'Unknown error'}`);
          }
        } else {
          // For other file types, use get method with alt=media
          console.log(`Fetching non-Google document: ${fileName}`);
          
          try {
            // Try using proxy first
            if (this.useProxy) {
              try {
                documentContent = await driveProxyService.downloadFile(token, documentId);
                console.log(`Successfully downloaded document via proxy: ${fileName}`);
              } catch (proxyError) {
                console.warn('Proxy download failed, falling back to direct API:', proxyError);
                // Fall back to direct API
                documentContent = '';
              }
            }
            
            // If proxy failed or not used, try direct API
            if (!documentContent) {
              try {
                // Try using GAPI first
                const response = await this.gapi.client.drive.files.get({
                  fileId: documentId,
                  alt: 'media'
                });
                
                if (response && response.body !== undefined) {
                  documentContent = response.body;
                } else {
                  throw new Error('Empty response from GAPI');
                }
              } catch (gapiError) {
                console.warn('GAPI fetch failed, falling back to fetch API:', gapiError);
                
                // Fallback to fetch API with CORS mode explicitly set
                const response = await fetch(
                  `https://www.googleapis.com/drive/v3/files/${documentId}?alt=media`,
                  {
                    headers: {
                      'Authorization': `Bearer ${token}`,
                      'Content-Type': 'application/json'
                    },
                    mode: 'cors' // Explicitly set CORS mode
                  }
                );
                
                if (!response.ok) {
                  throw new Error(`Failed to fetch file content: ${response.statusText}`);
                }
                
                // For text-based files
                if (mimeType.includes('text') || mimeType.includes('json') || 
                    mimeType.includes('javascript') || mimeType.includes('xml') ||
                    mimeType.includes('html') || mimeType.includes('css')) {
                  documentContent = await response.text();
                } else {
                  // For binary files, provide basic info
                  documentContent = `This file (${fileName}) is a binary file of type ${mimeType} and cannot be displayed as text.`;
                }
              }
            }
          } catch (fetchError) {
            console.error(`Error fetching document ${fileName}:`, fetchError);
            throw new Error(`Failed to fetch document content: ${fetchError.message || 'Unknown error'}`);
          }
        }
        
        // Validate content using document validation service
        const validation = documentValidationService.validateContent(
          documentContent, 
          fileName, 
          mimeType
        );
        
        if (!validation.isValid) {
          console.error(`Document validation failed for ${fileName}: ${validation.message}`);
          
          if (validation.content) {
            // Return possibly modified content with warning
            console.warn(`Returning potentially problematic content for ${fileName}`);
            toast.warning(`Document content may be incomplete`, {
              description: validation.message
            });
            return validation.content;
          }
          
          throw new Error(validation.message);
        }
        
        console.log(`Successfully fetched document content for ${fileName}, length: ${documentContent.length}`);
        return documentContent;
      });
    } catch (error) {
      console.error(`Error fetching document ${documentId} (${fileName}):`, error);
      
      // Enhanced error reporting with specific messages for different error types
      if (error.toString().includes('NetworkError') || error.toString().includes('network error')) {
        toast.error('Network error fetching document', { 
          description: 'Please check your connection and try again' 
        });
      } else if (error.toString().includes('CORS') || error.toString().includes('cross-origin')) {
        toast.error('Cross-origin error fetching document', { 
          description: 'Document access denied due to security settings' 
        });
      } else if (error.toString().includes('Authorization') || error.toString().includes('auth')) {
        toast.error('Authorization error', { 
          description: 'Please reconnect to Google Drive and try again' 
        });
      } else {
        toast.error('Failed to fetch document content', { 
          description: error instanceof Error ? error.message : 'Unknown error' 
        });
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
  getDocumentType(mimeType: string): string {
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
   * Check if API is loaded and authenticated
   */
  isReady(): boolean {
    return this.isApiLoaded && this.isAuthenticated;
  }
  
  /**
   * Get authentication status
   */
  isConnected(): boolean {
    return this.isAuthenticated;
  }
}
