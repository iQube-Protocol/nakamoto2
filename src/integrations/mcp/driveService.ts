
import { toast } from 'sonner';
import { GoogleApiLoader } from './googleApiLoader';

/**
 * Service for Google Drive operations
 */
export class DriveService {
  private googleApiLoader: GoogleApiLoader;
  private isAuthenticated: boolean = false;
  
  constructor(googleApiLoader: GoogleApiLoader) {
    this.googleApiLoader = googleApiLoader;
  }
  
  /**
   * Connect to Google Drive and authorize access
   */
  public async connectToDrive(clientId: string, apiKey: string, cachedToken?: string | null): Promise<boolean> {
    console.log('MCP: Connecting to Google Drive with credentials:', { clientId, apiKeyLength: apiKey?.length });
    
    if (!clientId || !apiKey) {
      toast.error('Missing Google API credentials', {
        description: 'Both Client ID and API Key are required'
      });
      return false;
    }
    
    const apiLoaded = await this.googleApiLoader.ensureGoogleApiLoaded();
    if (!apiLoaded) {
      console.error('Google API failed to load after waiting');
      toast.error('Google API failed to load', {
        description: 'Please refresh the page and try again.'
      });
      return false;
    }
    
    const gapi = this.googleApiLoader.getGapi();
    if (!gapi) {
      toast.error('Google API not available');
      return false;
    }
    
    try {
      // Initialize the Google API client with provided credentials
      await gapi.client.init({
        apiKey: apiKey,
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
      });
      
      // If we have a cached token, try to use it directly
      if (cachedToken) {
        try {
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
      
      // Use a promise to track the OAuth flow
      return new Promise((resolve) => {
        const tokenClient = googleAccounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'https://www.googleapis.com/auth/drive.readonly',
          callback: (tokenResponse: any) => {
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
            console.error('OAuth error:', error);
            toast.error('Google authentication failed', {
              description: error.message || 'Failed to authenticate with Google'
            });
            resolve(false);
          }
        });
        
        this.googleApiLoader.setTokenClient(tokenClient);
        
        // Request access token with a timeout for better UX
        tokenClient.requestAccessToken({ prompt: '' });
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
   * Load document metadata from Google Drive
   */
  public async listDocuments(folderId?: string): Promise<any[]> {
    console.log(`MCP: Listing documents${folderId ? ' in folder ' + folderId : ''}`);
    
    if (!this.isAuthenticated) {
      console.error('MCP: Not authenticated with Google Drive');
      toast.error('Not connected to Google Drive', { 
        description: 'Please connect to Google Drive first' 
      });
      return [];
    }
    
    const gapi = this.googleApiLoader.getGapi();
    if (!gapi) {
      toast.error('Google API not available');
      return [];
    }
    
    try {
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
   * Fetch a specific document content
   */
  public async fetchDocumentContent(documentId: string): Promise<{
    content: string;
    fileName: string;
    documentType: string;
  } | null> {
    console.log(`MCP: Fetching document content for ${documentId}`);
    
    if (!this.isAuthenticated) {
      console.error('MCP: Not authenticated with Google Drive');
      toast.error('Not connected to Google Drive', { 
        description: 'Please connect to Google Drive first' 
      });
      return null;
    }
    
    const gapi = this.googleApiLoader.getGapi();
    if (!gapi) {
      toast.error('Google API not available');
      return null;
    }
    
    try {
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
      
      return {
        content: documentContent,
        fileName,
        documentType
      };
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
  public isConnectedToDrive(): boolean {
    return this.isAuthenticated;
  }
  
  /**
   * Set authentication state
   */
  public setAuthenticated(authenticated: boolean): void {
    this.isAuthenticated = authenticated;
  }
}
