
import { toast } from 'sonner';
import { DocumentMetadata } from '../types';
import { GoogleDriveService } from '../GoogleDriveService';
import { RetryService } from '@/services/RetryService';

/**
 * Service for handling document operations with MCP
 */
export class MCPDocumentService {
  private driveService: GoogleDriveService;
  private retryService: RetryService;
  
  constructor(driveService: GoogleDriveService) {
    this.driveService = driveService;
    this.retryService = new RetryService({
      maxRetries: 2,
      baseDelay: 800,
      maxDelay: 5000
    });
  }
  
  /**
   * List documents from Google Drive
   */
  async listDocuments(folderId?: string): Promise<DocumentMetadata[]> {
    try {
      return await this.retryService.execute(() => this.driveService.listDocuments(folderId));
    } catch (error) {
      console.error('Error in listDocuments:', error);
      toast.error('Failed to list documents', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
      return [];
    }
  }
  
  /**
   * Fetch a specific document's content
   */
  async fetchDocumentContent(documentId: string): Promise<string | null> {
    try {
      // First get the file metadata
      console.log(`Fetching metadata for document ${documentId}`);
      let fileMetadata;
      
      try {
        fileMetadata = await this.retryService.execute(() => 
          this.driveService.gapi.client.drive.files.get({
            fileId: documentId,
            fields: 'name,mimeType'
          })
        );
      } catch (metadataError) {
        console.error(`Could not fetch metadata for document ${documentId}:`, metadataError);
        throw new Error('Failed to fetch document metadata');
      }
      
      if (!fileMetadata || !fileMetadata.result) {
        console.error(`Could not fetch metadata for document ${documentId}`);
        throw new Error('Failed to fetch document metadata');
      }
      
      const fileName = fileMetadata.result.name;
      const mimeType = fileMetadata.result.mimeType;
      
      console.log(`Fetching document: ${fileName}, type: ${mimeType}`);
      
      // Check if it's a folder
      if (mimeType.includes('folder')) {
        console.error('Cannot fetch content for folder');
        throw new Error('Cannot fetch content for a folder');
      }
      
      // Fetch the document content
      const documentContent = await this.driveService.fetchDocumentContent({
        id: documentId,
        name: fileName,
        mimeType: mimeType
      });
      
      if (!documentContent) {
        console.error(`Document content is empty for ${fileName}`);
        toast.error('Document content is empty', {
          description: `Could not extract content from ${fileName}`
        });
        return null;
      }
      
      // Verify the content is not just whitespace
      if (documentContent.trim().length === 0) {
        console.error(`Document content is only whitespace for ${fileName}`);
        toast.error('Document content is empty', {
          description: `Could not extract meaningful content from ${fileName}`
        });
        return null;
      }
      
      console.log(`Successfully fetched document content for ${fileName}, length: ${documentContent.length}`);
      return documentContent;
    } catch (error) {
      console.error(`Error fetching document ${documentId}:`, error);
      
      // Show appropriate error message based on error type
      if (error instanceof Error && error.toString().includes('Network Error')) {
        toast.error('Network error while fetching document', { 
          description: 'Please check your internet connection'
        });
      } else if (error instanceof Error && error.toString().includes('Authentication')) {
        toast.error('Authentication error', { 
          description: 'Your Google Drive session may have expired. Please reconnect.'
        });
      } else {
        toast.error('Failed to fetch document', { 
          description: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
      
      return null;
    }
  }
}
