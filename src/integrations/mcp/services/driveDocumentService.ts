
import { toast } from 'sonner';
import { GoogleApiLoader } from '../googleApiLoader';
import { BaseService } from './baseService';

/**
 * Service for Google Drive document operations
 */
export class DriveDocumentService extends BaseService {
  private googleApiLoader: GoogleApiLoader;
  private isAuthenticated: boolean = false;
  
  constructor(googleApiLoader: GoogleApiLoader) {
    super();
    this.googleApiLoader = googleApiLoader;
  }

  /**
   * Set authentication state
   */
  public setAuthenticated(authenticated: boolean): void {
    this.isAuthenticated = authenticated;
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
}
