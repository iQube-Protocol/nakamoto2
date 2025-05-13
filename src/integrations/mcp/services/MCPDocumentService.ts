
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
      const fileMetadata = await this.driveService.gapi.client.drive.files.get({
        fileId: documentId,
        fields: 'name,mimeType'
      });
      
      const fileName = fileMetadata.result.name;
      const mimeType = fileMetadata.result.mimeType;
      
      console.log(`Fetching document: ${fileName}, type: ${mimeType}`);
      
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
