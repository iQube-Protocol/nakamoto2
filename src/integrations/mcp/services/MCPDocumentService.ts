
import { toast } from 'sonner';
import { DocumentMetadata } from '../types';
import { GoogleDriveService } from '../GoogleDriveService';

/**
 * Service for handling document operations with MCP
 */
export class MCPDocumentService {
  private driveService: GoogleDriveService;
  
  constructor(driveService: GoogleDriveService) {
    this.driveService = driveService;
  }
  
  /**
   * List documents from Google Drive
   */
  async listDocuments(folderId?: string): Promise<DocumentMetadata[]> {
    return this.driveService.listDocuments(folderId);
  }
  
  /**
   * Fetch a specific document's content
   */
  async fetchDocumentContent(documentId: string): Promise<string | null> {
    try {
      // First get the file metadata
      console.log(`Fetching metadata for document ${documentId}`);
      const fileMetadata = await this.driveService.gapi.client.drive.files.get({
        fileId: documentId,
        fields: 'name,mimeType'
      });
      
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
      toast.error('Failed to fetch document', { 
        description: error instanceof Error ? error.message : 'Unknown error' 
      });
      return null;
    }
  }
}
