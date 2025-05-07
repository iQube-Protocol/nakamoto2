
import { GoogleApiLoader } from '../googleApiLoader';
import { DriveService } from '../driveService';
import { ContextManager } from '../contextManager';
import { toast } from 'sonner';

/**
 * Service for managing connections to external services
 */
export class ConnectionManager {
  private googleApiLoader: GoogleApiLoader;
  private driveService: DriveService;
  private contextManager: ContextManager;
  
  constructor(googleApiLoader: GoogleApiLoader, driveService: DriveService) {
    this.googleApiLoader = googleApiLoader;
    this.driveService = driveService;
    this.contextManager = new ContextManager();
  }
  
  /**
   * Load Google API with retry mechanism
   */
  public loadGoogleApiWithRetry(retryCount = 0): void {
    if (retryCount > 3) {
      console.error('MCP: Failed to load Google API after multiple retries');
      toast.error('Connection error', {
        description: 'Failed to load Google API after multiple attempts'
      });
      return;
    }
    
    try {
      this.googleApiLoader.loadGoogleApi();
      console.log('MCP: Google API loading initiated');
    } catch (error) {
      console.error('MCP: Error loading Google API:', error);
      
      // Retry with exponential backoff
      const timeout = Math.pow(2, retryCount) * 1000;
      console.log(`MCP: Retrying in ${timeout}ms...`);
      
      setTimeout(() => {
        this.loadGoogleApiWithRetry(retryCount + 1);
      }, timeout);
    }
  }
  
  /**
   * Connect to Google Drive and authorize access with improved error handling
   */
  public async connectToDrive(clientId: string, apiKey: string, cachedToken?: string | null): Promise<boolean> {
    try {
      // Ensure API is loaded before attempting connection
      await this.googleApiLoader.ensureGoogleApiLoaded();
      
      console.log('MCP: Attempting to connect to Drive with credentials');
      const success = await this.driveService.connectToDrive(clientId, apiKey, cachedToken);
      
      if (success) {
        console.log('MCP: Successfully connected to Google Drive');
        localStorage.setItem('gdrive-connected', 'true');
        toast.success('Connected to Google Drive');
        return true;
      } else {
        console.error('MCP: Failed to connect to Google Drive');
        localStorage.removeItem('gdrive-connected');
        toast.error('Failed to connect to Google Drive');
        return false;
      }
    } catch (error) {
      console.error('MCP: Error connecting to Drive:', error);
      localStorage.removeItem('gdrive-connected');
      toast.error('Connection error', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      });
      return false;
    }
  }
  
  /**
   * List documents with error handling
   */
  public async listDocuments(folderId?: string): Promise<any[]> {
    try {
      return await this.driveService.listDocuments(folderId);
    } catch (error) {
      console.error('MCP: Error listing documents:', error);
      toast.error('Failed to list documents', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      });
      return [];
    }
  }
  
  /**
   * Fetch document content with error handling
   */
  public async fetchDocumentContent(documentId: string, contextManager: ContextManager): Promise<string | null> {
    try {
      const docContent = await this.driveService.fetchDocumentContent(documentId);
      
      if (!docContent) return null;
      
      // Add to context
      contextManager.addDocumentToContext({
        documentId,
        documentName: docContent.fileName,
        documentType: docContent.documentType,
        content: docContent.content
      });
      
      return docContent.content;
    } catch (error) {
      console.error('MCP: Error fetching document:', error);
      toast.error('Failed to fetch document', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      });
      return null;
    }
  }
  
  /**
   * Reset connection state
   */
  public resetConnection(): void {
    localStorage.removeItem('gdrive-connected');
    localStorage.removeItem('gdrive-auth-token');
    this.driveService.setAuthenticated(false);
    toast.success('Connection reset');
  }
}
