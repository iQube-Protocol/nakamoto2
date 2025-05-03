
import { MCPClientOptions } from './types';
import { DriveOperations, createDriveOperations } from './drive/index';
import { ApiOperations } from './client/api-operations';
import { ContextOperations } from './client/context-operations';

/**
 * Main class for interacting with the MCP (Meta-Contextual Processor) server
 * Combines API, Context, and Drive operations
 */
export class MCPClient extends ContextOperations {
  private driveOperations: DriveOperations | null = null;
  
  constructor(options: MCPClientOptions = {}) {
    super(options);
    
    // Initialize Drive operations (conditionally after API is loaded)
    this.initializeDriveOperations();
  }
  
  /**
   * Initialize Google Drive operations
   */
  private initializeDriveOperations(): void {
    // Ensure Google API is loaded before initializing DriveOperations
    this.apiLoader.ensureGoogleApiLoaded().then(() => {
      this.driveOperations = createDriveOperations({
        apiLoader: this.apiLoader,
        contextManager: this.contextManager
      });
      console.log('Drive operations initialized successfully');
    }).catch(error => {
      console.error('Failed to load Google API, Drive operations not available', error);
    });
  }
  
  /**
   * Connect to Google Drive and authorize access
   */
  async connectToDrive(clientId: string, apiKey: string, cachedToken?: string | null): Promise<boolean> {
    if (!this.driveOperations) {
      console.warn('Drive operations not initialized, ensuring API is loaded...');
      try {
        // Try to load API and initialize drive operations
        await this.apiLoader.ensureGoogleApiLoaded();
        this.driveOperations = createDriveOperations({
          apiLoader: this.apiLoader,
          contextManager: this.contextManager
        });
      } catch (e) {
        console.error('Failed to initialize drive operations:', e);
        return false;
      }
    }
    
    if (!this.driveOperations) {
      console.error('Failed to initialize drive operations after retry');
      return false;
    }
    
    return this.driveOperations.connectToDrive(clientId, apiKey, cachedToken);
  }
  
  /**
   * List documents from Google Drive
   */
  async listDocuments(folderId?: string): Promise<any[]> {
    if (!this.driveOperations) {
      console.warn('Drive operations not initialized, ensuring API is loaded...');
      try {
        // Try to load API and initialize drive operations
        await this.apiLoader.ensureGoogleApiLoaded();
        this.driveOperations = createDriveOperations({
          apiLoader: this.apiLoader,
          contextManager: this.contextManager
        });
      } catch (e) {
        console.error('Failed to initialize drive operations:', e);
        return [];
      }
    }
    
    if (!this.driveOperations) {
      console.error('Failed to initialize drive operations for listing documents');
      return [];
    }
    
    return this.driveOperations.listDocuments(folderId);
  }
  
  /**
   * Fetch a specific document and add its content to the context
   */
  async fetchDocumentContent(documentId: string): Promise<string | null> {
    if (!this.driveOperations) {
      console.warn('Drive operations not initialized, ensuring API is loaded...');
      try {
        // Try to load API and initialize drive operations
        await this.apiLoader.ensureGoogleApiLoaded();
        this.driveOperations = createDriveOperations({
          apiLoader: this.apiLoader,
          contextManager: this.contextManager
        });
      } catch (e) {
        console.error('Failed to initialize drive operations:', e);
        return null;
      }
    }
    
    if (!this.driveOperations) {
      console.error('Failed to initialize drive operations for fetching document');
      return null;
    }
    
    return this.driveOperations.fetchDocumentContent(documentId);
  }
  
  /**
   * Check if connected to Google Drive
   */
  isConnectedToDrive(): boolean {
    return this.driveOperations?.isConnectedToDrive() || false;
  }
  
  /**
   * Get the current connection status
   */
  getConnectionStatus(): 'disconnected' | 'connecting' | 'connected' | 'error' {
    return this.driveOperations?.getConnectionStatus() || 'disconnected';
  }
  
  /**
   * Reset the Google Drive connection
   */
  resetDriveConnection(): void {
    this.driveOperations?.setAuthenticationState(false);
  }
  
  /**
   * Clean up resources
   */
  cleanup(): void {
    this.driveOperations?.cleanup();
  }
  
  /**
   * Check if API is loaded
   */
  isApiLoaded(): boolean {
    return this.apiLoader.isLoaded();
  }
  
  /**
   * Force reload the Google API
   */
  reloadGoogleApi(): void {
    return this.apiLoader.reloadGoogleApi();
  }
}

// Function to create a new MCP client
export function getMCPClient(options: MCPClientOptions = {}): MCPClient {
  return new MCPClient(options);
}

// Re-export types with proper 'export type' syntax for isolatedModules
export type { MCPContext } from './types';
export type { MCPClientOptions } from './types';
