
import { toast } from 'sonner';
import { DocumentMetadata } from '../types';
import { GoogleDriveService } from '../GoogleDriveService';
import { RetryService } from '@/services/RetryService';
import { documentValidationService } from '@/services/DocumentValidationService';
import { driveProxyService } from './DriveProxyService';

/**
 * Service for handling document operations with MCP
 */
export class MCPDocumentService {
  private driveService: GoogleDriveService;
  private retryService: RetryService;
  private useProxy: boolean = true; // Default to using proxy when available
  private lastProxyError: number = 0;
  private proxyErrorCooldown: number = 60000; // 1 minute cooldown after proxy errors
  private debug: boolean = false;
  
  constructor(driveService: GoogleDriveService, debug: boolean = false) {
    this.driveService = driveService;
    this.debug = debug;
    this.retryService = new RetryService({
      maxRetries: 3,
      baseDelay: 800,
      maxDelay: 5000,
      retryCondition: (error) => {
        // Retry on network errors, CORS issues, and auth issues
        return this.isRetryableError(error);
      }
    });
  }
  
  /**
   * Helper method to check if an error is retryable
   */
  private isRetryableError(error: any): boolean {
    const errorStr = String(error).toLowerCase();
    
    // Don't retry on document content validation errors
    if (errorStr.includes('content is empty') || 
        errorStr.includes('binary file') ||
        errorStr.includes('suspiciously short')) {
      return false;
    }
    
    // Retry on network and auth errors
    return errorStr.includes('network error') || 
      errorStr.includes('cors') ||
      errorStr.includes('auth') ||
      (error.status && (error.status === 401 || error.status === 403 || error.status >= 500));
  }

  private log(message: string, ...args: any[]): void {
    if (this.debug) {
      console.log(`[MCPDocumentService] ${message}`, ...args);
    }
  }
  
  /**
   * List documents from Google Drive
   */
  async listDocuments(folderId?: string): Promise<DocumentMetadata[]> {
    try {
      this.log(`Listing documents${folderId ? ` in folder ${folderId}` : ''}`);
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
   * Fetch a specific document's content with enhanced validation
   */
  async fetchDocumentContent(documentId: string): Promise<string | null> {
    try {
      // First get the file metadata
      this.log(`Fetching metadata for document ${documentId}`);
      let fileMetadata;
      
      try {
        // Try to use proxy if it hasn't failed recently
        if (this.useProxy && Date.now() - this.lastProxyError > this.proxyErrorCooldown) {
          try {
            const token = this.driveService.gapi?.auth?.getToken()?.access_token;
            if (token) {
              const metadata = await driveProxyService.getFileMetadata(token, documentId);
              if (metadata && metadata.name) {
                fileMetadata = { result: metadata };
                this.log('Got metadata via proxy');
              }
            }
          } catch (proxyError) {
            console.warn('Proxy metadata fetch failed:', proxyError);
            this.lastProxyError = Date.now();
            // Fall back to direct API
          }
        }
        
        // Fall back to direct API if proxy not used or failed
        if (!fileMetadata) {
          fileMetadata = await this.retryService.execute(() => 
            this.driveService.gapi.client.drive.files.get({
              fileId: documentId,
              fields: 'name,mimeType'
            })
          );
        }
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
      
      this.log(`Fetching document: ${fileName}, type: ${mimeType}`);
      
      // Check if it's a folder
      if (mimeType.includes('folder')) {
        console.error('Cannot fetch content for folder');
        throw new Error('Cannot fetch content for a folder');
      }
      
      // Create document metadata object
      const documentMetadata: DocumentMetadata = {
        id: documentId,
        name: fileName,
        mimeType: mimeType
      };
      
      // Fetch the document content with enhanced retry and validation
      const documentContent = await this.retryService.execute(() => 
        this.driveService.fetchDocumentContent(documentMetadata)
      );
      
      // Additional validation using the document validation service
      if (documentContent) {
        const validation = documentValidationService.validateContent(
          documentContent, 
          fileName, 
          mimeType
        );
        
        if (!validation.isValid) {
          console.error(`Document validation failed: ${validation.message}`);
          
          // If we have some content but it's not ideal, warn but allow using it
          if (validation.content) {
            toast.warning('Document content may be incomplete', {
              description: validation.message
            });
            return validation.content;
          }
          
          toast.error('Document content is invalid', {
            description: validation.message
          });
          return null;
        }
      } else {
        console.error(`Document content is null for ${fileName}`);
        toast.error('Document content is empty', {
          description: `Could not extract content from ${fileName}`
        });
        return null;
      }
      
      this.log(`Successfully fetched document content for ${fileName}, length: ${documentContent.length}`);
      console.log(`Document ${fileName} content sample:`, documentContent.substring(0, 200) + '...');
      return documentContent;
    } catch (error) {
      console.error(`Error fetching document ${documentId}:`, error);
      
      // Show appropriate error message based on error type
      if (error.toString().includes('Network Error')) {
        toast.error('Network error while fetching document', { 
          description: 'Please check your internet connection'
        });
      } else if (error.toString().includes('Authentication')) {
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
  
  /**
   * Reset proxy error state to retry using proxy
   */
  resetProxyErrorState(): void {
    this.lastProxyError = 0;
    driveProxyService.resetErrorState();
  }
  
  /**
   * Enable or disable debug logging
   */
  setDebugMode(debug: boolean): void {
    this.debug = debug;
    this.log(`Debug mode ${debug ? 'enabled' : 'disabled'}`);
  }
}
