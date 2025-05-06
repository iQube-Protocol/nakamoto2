
import { toast } from 'sonner';
import { GoogleApiLoader } from '../googleApiLoader';
import { DriveService } from '../driveService';
import { BaseService } from './baseService';
import { ContextManager } from '../contextManager';

/**
 * Manages Google Drive connections and document operations
 */
export class ConnectionManager extends BaseService {
  private googleApiLoader: GoogleApiLoader;
  private driveService: DriveService;
  private connectionTimeouts: Record<string, NodeJS.Timeout> = {};
  
  constructor(googleApiLoader: GoogleApiLoader, driveService: DriveService) {
    super();
    this.googleApiLoader = googleApiLoader;
    this.driveService = driveService;
  }

  /**
   * Load Google API with retry mechanism
   */
  public loadGoogleApiWithRetry(retryCount = 0): void {
    try {
      this.googleApiLoader.loadGoogleApi();
      
      // Clear any previous timeout
      if (this.connectionTimeouts['loadApi']) {
        clearTimeout(this.connectionTimeouts['loadApi']);
      }
      
      // Set timeout to check if API was loaded successfully
      this.connectionTimeouts['loadApi'] = setTimeout(() => {
        if (!this.googleApiLoader.isLoaded() && retryCount < 2) {
          console.log(`MCP: Google API failed to load, retrying (${retryCount + 1}/2)...`);
          this.loadGoogleApiWithRetry(retryCount + 1);
        } else if (!this.googleApiLoader.isLoaded()) {
          console.error('MCP: Google API failed to load after multiple attempts');
        }
      }, 5000); // Check after 5 seconds
    } catch (error) {
      console.error('MCP: Error loading Google API:', error);
    }
  }
  
  /**
   * Connect to Google Drive and authorize access with improved error handling
   */
  public async connectToDrive(clientId: string, apiKey: string, cachedToken?: string | null): Promise<boolean> {
    try {
      // Clear any connection timeout
      if (this.connectionTimeouts['connect']) {
        clearTimeout(this.connectionTimeouts['connect']);
      }
      
      // Set a timeout to prevent hanging
      const timeoutPromise = new Promise<boolean>((resolve) => {
        this.connectionTimeouts['connect'] = setTimeout(() => {
          console.error('MCP: Connection to Google Drive timed out');
          toast.error('Connection timed out', {
            description: 'Please check your network and try again'
          });
          resolve(false);
        }, 15000); // 15 seconds timeout
      });
      
      // Race between the actual connection and timeout
      const result = await Promise.race([
        this.driveService.connectToDrive(clientId, apiKey, cachedToken),
        timeoutPromise
      ]);
      
      // Clear the timeout if connection completed
      clearTimeout(this.connectionTimeouts['connect']);
      
      return result;
    } catch (error) {
      console.error('MCP: Error in connectToDrive:', error);
      toast.error('Connection failed', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      });
      return false;
    }
  }
  
  /**
   * Load document metadata from Google Drive with timeout and error handling
   */
  public async listDocuments(folderId?: string): Promise<any[]> {
    try {
      // Clear any listing timeout
      if (this.connectionTimeouts['listDocs']) {
        clearTimeout(this.connectionTimeouts['listDocs']);
      }
      
      // Set a timeout to prevent hanging
      const timeoutPromise = new Promise<any[]>((resolve) => {
        this.connectionTimeouts['listDocs'] = setTimeout(() => {
          console.error('MCP: Listing documents timed out');
          toast.error('Document listing timed out', {
            description: 'Please check your network and try again'
          });
          resolve([]);
        }, 10000); // 10 seconds timeout
      });
      
      // Race between the actual listing and timeout
      const result = await Promise.race([
        this.driveService.listDocuments(folderId),
        timeoutPromise
      ]);
      
      // Clear the timeout if listing completed
      clearTimeout(this.connectionTimeouts['listDocs']);
      
      return result;
    } catch (error) {
      console.error('MCP: Error in listDocuments:', error);
      toast.error('Failed to list documents', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      });
      return [];
    }
  }
  
  /**
   * Fetch a specific document and add its content to the context with improved error handling
   */
  public async fetchDocumentContent(documentId: string, contextManager: ContextManager): Promise<string | null> {
    try {
      // Clear any fetch timeout
      if (this.connectionTimeouts['fetchDoc']) {
        clearTimeout(this.connectionTimeouts['fetchDoc']);
      }
      
      // Set a timeout to prevent hanging
      const timeoutPromise = new Promise<null>((resolve) => {
        this.connectionTimeouts['fetchDoc'] = setTimeout(() => {
          console.error('MCP: Document fetch timed out');
          toast.error('Document fetch timed out', {
            description: 'Please check your network and try again'
          });
          resolve(null);
        }, 12000); // 12 seconds timeout
      });
      
      // Race between the actual fetch and timeout
      const result = await Promise.race([
        this.driveService.fetchDocumentContent(documentId),
        timeoutPromise
      ]);
      
      // Clear the timeout if fetch completed
      clearTimeout(this.connectionTimeouts['fetchDoc']);
      
      if (!result) return null;
      
      // Add to context
      contextManager.addDocumentToContext({
        documentId,
        documentName: result.fileName,
        documentType: result.documentType,
        content: result.content
      });
      
      return result.content;
    } catch (error) {
      console.error(`MCP: Error fetching document ${documentId}:`, error);
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
    // Clear all timeouts
    Object.values(this.connectionTimeouts).forEach(timeout => clearTimeout(timeout));
    this.connectionTimeouts = {};
    
    // Reset services
    this.driveService.setAuthenticated(false);
    localStorage.removeItem('gdrive-connected');
    localStorage.removeItem('gdrive-auth-token');
    
    // Reload the Google API
    this.loadGoogleApiWithRetry();
  }
}
