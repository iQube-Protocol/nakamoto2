
import { toast } from 'sonner';
import { GoogleApiLoader } from './api-loader';
import { ContextManager } from './context-manager';

/**
 * Manages operations with Google Drive
 */
export class DriveOperations {
  private apiLoader: GoogleApiLoader;
  private contextManager: ContextManager;
  private isAuthenticated: boolean = false;
  
  constructor(apiLoader: GoogleApiLoader, contextManager: ContextManager) {
    this.apiLoader = apiLoader;
    this.contextManager = contextManager;
  }
  
  /**
   * Connect to Google Drive and authorize access with optimizations and better error handling
   */
  async connectToDrive(clientId: string, apiKey: string, cachedToken?: string | null): Promise<boolean> {
    console.log('MCP: Connecting to Google Drive with credentials:', { clientId, apiKeyLength: apiKey?.length });
    
    if (!clientId || !apiKey) {
      toast.error('Missing Google API credentials', {
        description: 'Both Client ID and API Key are required'
      });
      return false;
    }
    
    try {
      // Wait for API to be loaded with a proper timeout
      const apiLoaded = await this.apiLoader.ensureGoogleApiLoaded();
      if (!apiLoaded) {
        console.error('Google API failed to load after waiting');
        toast.error('Google API failed to load', {
          description: 'Please refresh the page and try again.'
        });
        return false;
      }
      
      const gapi = this.apiLoader.getGapiClient();
      
      // Check if gapi is available
      if (!gapi || !gapi.client) {
        console.error('Google API client not available');
        toast.error('Google API client not available', {
          description: 'Please refresh the page and try again.'
        });
        return false;
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
        toast.error('Failed to initialize Google API client', {
          description: error instanceof Error ? error.message : 'Unknown error'
        });
        return false;
      }
      
      // If we have a cached token, try to use it directly
      if (cachedToken) {
        try {
          console.log('MCP: Trying cached token');
          gapi.client.setToken(JSON.parse(cachedToken));
          
          // Test if the token is still valid with a simple API call
          try {
            await gapi.client.drive.files.list({
              pageSize: 1,
              fields: 'files(id)'
            });
            
            // If we got here, the token is valid
            this.isAuthenticated = true;
            localStorage.setItem('gdrive-connected', 'true');
            console.log('Successfully authenticated with Google Drive using cached token');
            return true;
          } catch (e) {
            // Token is invalid, proceed with normal flow
            console.log('Cached token is invalid, proceeding with regular auth flow');
          }
        } catch (e) {
          console.error('Error parsing cached token:', e);
        }
      }
      
      // Create token client for OAuth 2.0 flow (only if cached token didn't work)
      const googleAccounts = (window as any).google?.accounts;
      if (!googleAccounts) {
        toast.error('Google Sign-In API not available', {
          description: 'Please check your internet connection and try again'
        });
        return false;
      }
      
      // Use a promise to track the OAuth flow with a timeout
      return new Promise((resolve) => {
        // Add a timeout to avoid hanging UI if auth callback doesn't fire
        const authTimeout = setTimeout(() => {
          console.error('OAuth flow timed out');
          toast.error('Authentication timed out', {
            description: 'Please try again or refresh the page'
          });
          resolve(false);
        }, 30000); // 30 second timeout
        
        try {
          const tokenClient = googleAccounts.oauth2.initTokenClient({
            client_id: clientId,
            scope: 'https://www.googleapis.com/auth/drive.readonly',
            callback: (tokenResponse: any) => {
              clearTimeout(authTimeout);
              if (tokenResponse && tokenResponse.access_token) {
                this.isAuthenticated = true;
                localStorage.setItem('gdrive-connected', 'true');
                
                // Cache the token
                try {
                  localStorage.setItem('gdrive-auth-token', JSON.stringify(gapi.client.getToken()));
                } catch (e) {
                  console.error('Failed to cache token:', e);
                }
                
                toast.success('Connected to Google Drive', {
                  description: 'Your Google Drive documents are now available to the AI agents'
                });
                console.log('Successfully authenticated with Google Drive');
                resolve(true);
              } else {
                resolve(false);
              }
            },
            error_callback: (error: any) => {
              clearTimeout(authTimeout);
              console.error('OAuth error:', error);
              toast.error('Google authentication failed', {
                description: error.message || 'Failed to authenticate with Google'
              });
              resolve(false);
            }
          });
          
          // Request access token
          console.log('MCP: Requesting OAuth token');
          tokenClient.requestAccessToken({ prompt: 'consent' }); // Changed from '' to 'consent' to ensure proper auth flow
        } catch (e) {
          clearTimeout(authTimeout);
          console.error('Error requesting access token:', e);
          toast.error('Google authentication failed', {
            description: e instanceof Error ? e.message : 'Failed to authenticate with Google'
          });
          resolve(false);
        }
      });
    } catch (error) {
      console.error('MCP: Error connecting to Google Drive:', error);
      toast.error('Google Drive connection failed', { 
        description: error instanceof Error ? error.message : 'Unknown error' 
      });
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
        description: 'Please connect to Google Drive first' 
      });
      return [];
    }
    
    try {
      const gapi = this.apiLoader.getGapiClient();
      const query = folderId ? 
        `'${folderId}' in parents and trashed = false` : 
        `'root' in parents and trashed = false`;
      
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
      return files;
    } catch (error) {
      console.error('MCP: Error listing documents from Google Drive:', error);
      toast.error('Failed to list documents', { 
        description: error instanceof Error ? error.message : 'Unknown error' 
      });
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
        description: 'Please connect to Google Drive first' 
      });
      return null;
    }
    
    try {
      const gapi = this.apiLoader.getGapiClient();
      
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
      
      // Extract document type from mimeType
      const documentType = this.getDocumentType(mimeType);
      
      // Add to context
      this.contextManager.addDocumentToContext(documentId, fileName, documentType, documentContent);
      
      return documentContent;
    } catch (error) {
      console.error(`MCP: Error fetching document ${documentId}:`, error);
      toast.error('Failed to fetch document', { 
        description: error instanceof Error ? error.message : 'Unknown error' 
      });
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
   * Check if connected to Google Drive
   */
  isConnectedToDrive(): boolean {
    return this.isAuthenticated || localStorage.getItem('gdrive-connected') === 'true';
  }
  
  /**
   * Set authentication state
   */
  setAuthenticationState(state: boolean): void {
    this.isAuthenticated = state;
  }
}
