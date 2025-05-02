
import { toast } from 'sonner';
import { GoogleApiLoader } from '../../googleApiLoader';

/**
 * Service for listing Google Drive documents
 */
export class DocumentLister {
  private googleApiLoader: GoogleApiLoader;
  
  constructor(googleApiLoader: GoogleApiLoader) {
    this.googleApiLoader = googleApiLoader;
  }
  
  /**
   * Load document metadata from Google Drive
   */
  public async listDocuments(folderId?: string): Promise<any[]> {
    console.log(`MCP: Listing documents${folderId ? ' in folder ' + folderId : ''}`);
    
    const gapi = this.googleApiLoader.getGapi();
    if (!gapi) {
      toast.error('Google API not available');
      return [];
    }
    
    // Check if client is initialized and available
    if (!gapi.client) {
      console.error('Google client not initialized, attempting to initialize');
      
      return new Promise<any[]>((resolve) => {
        gapi.load('client', {
          callback: async () => {
            console.log('Client API loaded in listDocuments, attempting to list documents');
            try {
              const docs = await this.executeListDocuments(folderId);
              resolve(docs);
            } catch (err) {
              console.error('Error listing documents after client initialization:', err);
              resolve([]);
            }
          },
          onerror: () => {
            console.error('Failed to load client API in listDocuments');
            toast.error('Failed to initialize Google API client');
            resolve([]);
          },
          timeout: 10000
        });
      });
    }
    
    return this.executeListDocuments(folderId);
  }
  
  /**
   * Execute document listing once client is initialized
   */
  private async executeListDocuments(folderId?: string): Promise<any[]> {
    const gapi = this.googleApiLoader.getGapi();
    if (!gapi || !gapi.client || !gapi.client.drive) {
      console.error('Google Drive API not available');
      toast.error('Google Drive API not available', {
        description: 'Please check if the Drive API is enabled in your Google Cloud Console'
      });
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
}
