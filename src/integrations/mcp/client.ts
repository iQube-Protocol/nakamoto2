import { MCPClientOptions } from './types';
import { DriveOperations, createDriveOperations } from './drive/index';
import { ApiOperations } from './client/api-operations';
import { ContextOperations } from './client/context-operations';
import { GoogleApiLoader } from './api/google-api-loader';

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
    this.apiLoader.ensureGoogleApiLoaded().then((success) => {
      if (!success) {
        console.warn('Google API failed to load, Drive operations may not be available');
        return;
      }
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
   * Connect to Google Drive and authorize access with additional verification
   */
  async connectToDrive(clientId: string, apiKey: string, cachedToken?: string | null): Promise<boolean> {
    // Verify parameters first
    if (!clientId || !apiKey) {
      console.error('MCP: Missing credentials for Google Drive connection');
      return false;
    }
    
    // Make sure API is loaded
    if (!this.apiLoader.isLoaded()) {
      console.log('MCP: Google API not loaded yet, attempting to load before connecting');
      try {
        const loaded = await this.apiLoader.ensureGoogleApiLoaded();
        if (!loaded) {
          console.error('MCP: Failed to load Google API');
          return false;
        }
      } catch (error) {
        console.error('MCP: Error loading Google API:', error);
        return false;
      }
    }
    
    // Initialize drive operations if needed
    if (!this.driveOperations) {
      console.log('MCP: Drive operations not initialized, creating now');
      try {
        this.driveOperations = createDriveOperations({
          apiLoader: this.apiLoader,
          contextManager: this.contextManager
        });
      } catch (e) {
        console.error('MCP: Failed to initialize drive operations:', e);
        return false;
      }
    }
    
    if (!this.driveOperations) {
      console.error('MCP: Failed to initialize drive operations after retry');
      return false;
    }
    
    // Check if GAPI client is available before connecting
    if (!this.apiLoader.getGapiClient()) {
      console.error('MCP: Google API client not available for connection');
      return false;
    }
    
    console.log('MCP: Connecting to drive with credentials', { 
      hasCachedToken: !!cachedToken,
      clientIdLength: clientId.length,
      apiKeyLength: apiKey.length
    });
    
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
        const apiLoaded = await this.apiLoader.ensureGoogleApiLoaded();
        if (!apiLoaded) {
          console.error('Failed to load Google API');
          return [];
        }
        
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
        const apiLoaded = await this.apiLoader.ensureGoogleApiLoaded();
        if (!apiLoaded) {
          console.error('Failed to load Google API');
          return null;
        }
        
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
   * Check if API is loaded
   */
  isApiLoaded(): boolean {
    return this.apiLoader.isLoaded();
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
   * Reset Drive connection with enhanced functionality
   */
  resetDriveConnection(): void {
    // First, clean up stored credentials
    if (typeof window !== 'undefined') {
      localStorage.removeItem('gdrive-connected');
      localStorage.removeItem('gdrive-auth-token');
    }
    
    // Reset API loader state directly
    this.apiLoader.fullReset();
    
    // Then, if drive operations exist, reset them too
    if (this.driveOperations) {
      this.driveOperations.resetConnection();
    }
    
    console.log('MCP: Drive connection reset completed');
  }
}

/**
 * Create a new MCP client
 */
export function getMCPClient(options: MCPClientOptions = {}): MCPClient {
  try {
    // Use a singleton pattern to prevent multiple instances
    if (typeof window !== 'undefined') {
      if (!(window as any).__mcpClient) {
        (window as any).__mcpClient = new MCPClient(options);
      }
      return (window as any).__mcpClient;
    }
    
    // Fallback to creating a new instance if window is not available
    return new MCPClient(options);
  } catch (error) {
    console.error('Error creating MCP client:', error);
    throw error;
  }
}

// Export types
export type { MCPClientOptions } from './types';
