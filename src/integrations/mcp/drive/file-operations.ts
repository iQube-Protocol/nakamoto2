
import { toast } from 'sonner';
import { getDocumentType, getExportMimeType, isAuthError } from './utils';

export class FileOperations {
  private apiLoader: any; // GoogleApiLoader
  private contextManager: any; // ContextManager
  private authManager: any; // AuthManager
  
  constructor(apiLoader: any, contextManager: any, authManager: any) {
    this.apiLoader = apiLoader;
    this.contextManager = contextManager;
    this.authManager = authManager;
  }

  /**
   * Load document metadata from Google Drive 
   */
  async listDocuments(folderId?: string): Promise<any[]> {
    console.log(`MCP: Listing documents${folderId ? ' in folder ' + folderId : ''}`);
    
    if (!this.authManager.isConnectedToDrive()) {
      console.error('MCP: Not authenticated with Google Drive');
      toast.error('Not connected to Google Drive', { 
        description: 'Please connect to Google Drive first',
        duration: 3000,
        id: 'drive-list-error',
      });
      return [];
    }
    
    // First verify the connection is still valid
    const isValid = await this.authManager.verifyConnection().catch(() => false);
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
      if (isAuthError(error)) {
        console.log('MCP: Authentication error detected, resetting connection state');
        this.authManager.setAuthenticationState(false);
      }
      
      return [];
    }
  }

  /**
   * Fetch a specific document and add its content to the context
   */
  async fetchDocumentContent(documentId: string): Promise<string | null> {
    console.log(`MCP: Fetching document content for ${documentId}`);
    
    if (!this.authManager.isConnectedToDrive()) {
      console.error('MCP: Not authenticated with Google Drive');
      toast.error('Not connected to Google Drive', { 
        description: 'Please connect to Google Drive first',
        duration: 3000,
      });
      return null;
    }
    
    // Verify connection is still valid
    const isValid = await this.authManager.verifyConnection().catch(() => false);
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
        const exportMimeType = getExportMimeType(mimeType);
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
      const documentType = getDocumentType(mimeType);
      
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
      if (isAuthError(error)) {
        console.log('MCP: Authentication error detected, resetting connection state');
        this.authManager.setAuthenticationState(false);
      }
      
      return null;
    }
  }
}
