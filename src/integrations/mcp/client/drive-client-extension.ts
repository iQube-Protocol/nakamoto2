
import { MCPClientBase } from './client-base';
import { DriveOperations, createDriveOperations } from '../drive/index';

/**
 * Extension for MCPClient that adds Drive functionality
 */
export class DriveClientExtension extends MCPClientBase {
  private driveOperations: DriveOperations | null = null;
  
  /**
   * Initialize Google Drive operations
   */
  protected initializeDriveOperations(): void {
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
      
      // Clean up any cached document data
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith('gdrive-')) {
          sessionStorage.removeItem(key);
        }
      });
    }
    
    // Reset API loader state directly for a thorough cleanup
    this.apiLoader.fullReset();
    
    // Then, if drive operations exist, reset them too
    if (this.driveOperations) {
      this.driveOperations.resetConnection();
    }
    
    console.log('MCP: Drive connection reset completed');
  }
}
