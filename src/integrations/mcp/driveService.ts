
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
    
    // Ensure API is loaded or try loading it
    const apiLoaded = await this.googleApiLoader.ensureGoogleApiLoaded();
    if (!apiLoaded) {
      console.error('Google API failed to load, attempting to reload...');
      // Try reloading the API
      this.googleApiLoader.loadGoogleApi();
      
      // Wait a bit and check again
      await new Promise(resolve => setTimeout(resolve, 2000));
      const reloaded = await this.googleApiLoader.ensureGoogleApiLoaded();
      
      if (!reloaded) {
        console.error('Google API failed to load after reload attempt');
        toast.error('Google API failed to load', {
          description: 'Please refresh the page and try again.'
        });
        return false;
      }
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
          console.log('MCP: Attempting to use cached token');
          gapi.client.setToken(JSON.parse(cachedToken));
          
          // Test if the token is still valid with a simple API call
          try {
            console.log('MCP: Testing cached token validity');
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
            
            // Check for specific error types and show user-friendly messages
            const error = e as any;
            if (error.status === 401) {
              console.log('Token expired, need to re-authenticate');
            } else if (error.status === 403) {
              console.log('Permission denied, check API Key and scopes');
              toast.error('Google API access denied', {
                description: 'Please check your API key and permissions'
              });
              return false;
            }
          }
        } catch (e) {
          console.error('Error parsing or using cached token:', e);
          // Clear invalid token
          localStorage.removeItem('gdrive-auth-token');
        }
      }
      
      // Create token client for OAuth 2.0 flow (only if cached token didn't work)
      const googleAccounts = (window as any).google?.accounts;
      if (!googleAccounts) {
        console.error('Google Sign-In API not available, checking if script loaded');
        
        // Check if gsi script is in DOM but not initialized yet
        const gsiScript = document.querySelector('script[src*="gsi/client"]');
        if (!gsiScript) {
          console.log('GSI script not found in DOM, trying to reload it');
          // Try reloading the GSI script directly
          const newScript = document.createElement('script');
          newScript.src = 'https://accounts.google.com/gsi/client';
          newScript.async = true;
          document.body.appendChild(newScript);
          
          // Wait for the script to load
          await new Promise((resolve) => {
            newScript.onload = resolve;
            setTimeout(resolve, 3000); // Timeout after 3 seconds
          });
          
          // Check again after loading
          if (!(window as any).google?.accounts) {
            toast.error('Google Sign-In API not available', {
              description: 'Please check your internet connection and try again'
            });
            return false;
          }
        } else {
          toast.error('Google Sign-In API not available', {
            description: 'Please check your internet connection and try again'
          });
          return false;
        }
      }
      
      // Use a promise with timeout to track the OAuth flow
      return new Promise<boolean>((resolve) => {
        // Set a timeout for the whole auth process
        const authTimeout = setTimeout(() => {
          console.error('OAuth flow timed out');
          toast.error('Authentication timed out', {
            description: 'Please try again later'
          });
          resolve(false);
        }, 30000); // 30 seconds timeout
        
        try {
          const tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
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
                console.error('Token response missing access token');
                toast.error('Authentication failed', {
                  description: 'Failed to get access token'
                });
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
          
          this.googleApiLoader.setTokenClient(tokenClient);
          
          // Request access token
          console.log('MCP: Requesting access token...');
          tokenClient.requestAccessToken({ prompt: 'consent' });
        } catch (error) {
          clearTimeout(authTimeout);
          console.error('Error initializing token client:', error);
          toast.error('Authentication initialization failed', {
            description: error instanceof Error ? error.message : 'Unknown error'
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
      
      console.log(`MCP: Executing Drive query: ${query}`);
      
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
      console.log(`MCP: Found ${files?.length || 0} files in Google Drive`, files || []);
      
      // If no files were returned, check if it's due to permission issues
      if (!files || files.length === 0) {
        console.log('MCP: No files found, checking if it\'s a permission issue');
        try {
          // Try to get Drive user info to check if connection is working
          await gapi.client.drive.about.get({
            fields: 'user'
          });
          // If we got here, the connection works but folder might be empty
          console.log('MCP: Drive connection is working, folder may be empty');
        } catch (error) {
          console.error('MCP: Error checking Drive connection:', error);
          // Token might be expired, clear connection state
          if ((error as any).status === 401) {
            localStorage.removeItem('gdrive-auth-token');
            this.isAuthenticated = false;
            localStorage.setItem('gdrive-connected', 'false');
            toast.error('Google Drive session expired', {
              description: 'Please reconnect to Google Drive'
            });
          }
        }
      }
      
      return files || [];
    } catch (error) {
      console.error('MCP: Error listing documents from Google Drive:', error);
      
      // Check if it's an authentication error
      if ((error as any).status === 401) {
        localStorage.removeItem('gdrive-auth-token');
        this.isAuthenticated = false;
        localStorage.setItem('gdrive-connected', 'false');
        toast.error('Google Drive session expired', {
          description: 'Please reconnect to Google Drive'
        });
      } else {
        toast.error('Failed to list documents', { 
          description: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
      
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
    if (!authenticated) {
      localStorage.setItem('gdrive-connected', 'false');
    }
  }
}
