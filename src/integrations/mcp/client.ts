
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
    }).catch(error => {
      console.error('Failed to load Google API, Drive operations not available', error);
    });
  }
  
  /**
   * Connect to Google Drive and authorize access
   */
  async connectToDrive(clientId: string, apiKey: string, cachedToken?: string | null): Promise<boolean> {
    if (!this.driveOperations) {
      console.warn('Drive operations not initialized, ensure API is loaded');
      return false;
    }
    
    return this.driveOperations.connectToDrive(clientId, apiKey, cachedToken);
  }
  
  /**
   * List documents from Google Drive
   */
  async listDocuments(folderId?: string): Promise<any[]> {
    if (!this.driveOperations) {
      console.warn('Drive operations not initialized, ensure API is loaded');
      return [];
    }
    
    return this.driveOperations.listDocuments(folderId);
  }
  
  /**
   * Fetch a specific document and add its content to the context
   */
  async fetchDocumentContent(documentId: string): Promise<string | null> {
    if (!this.driveOperations) {
      console.warn('Drive operations not initialized, ensure API is loaded');
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
}

// Function to create a new MCP client
export function getMCPClient(options: MCPClientOptions = {}): MCPClient {
  return new MCPClient(options);
}

// Re-export types
export { MCPContext, MCPClientOptions } from './types';
