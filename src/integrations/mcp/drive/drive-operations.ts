import { DriveOperationsConfig, ConnectionStatus } from './types';
import { AuthManager } from './auth-manager';
import { FileOperations } from './file-operations';
import { ConnectionMonitor } from './connection-monitor';

/**
 * Drive operations for the MCP client
 */
export class DriveOperations {
  private config: DriveOperationsConfig;
  private authManager: AuthManager;
  private fileOperations: FileOperations;
  private connectionMonitor: ConnectionMonitor;
  private connectionStatus: ConnectionStatus = 'disconnected';

  constructor(config: DriveOperationsConfig) {
    this.config = config;
    
    // Initialize auth manager
    this.authManager = new AuthManager({
      apiLoader: config.apiLoader
    });
    
    // Initialize file operations
    this.fileOperations = new FileOperations({
      apiLoader: config.apiLoader,
      authManager: this.authManager
    });
    
    // Initialize connection monitor
    this.connectionMonitor = new ConnectionMonitor({
      authManager: this.authManager,
      onStatusChange: this.handleStatusChange.bind(this)
    });
    
    // Start monitoring connection
    this.connectionMonitor.startMonitoring();
  }
  
  /**
   * Reset the connection state completely
   */
  resetConnection(): void {
    // Reset auth state
    this.authManager.resetAuth();
    
    // Full reset for API loader
    this.config.apiLoader.fullReset();
    
    // Cleanup connection monitor
    this.connectionMonitor.stopMonitoring();
    this.connectionMonitor.startMonitoring();
    
    // Reset connection status
    this.connectionStatus = 'disconnected';
  }
  
  /**
   * Handler for connection status changes
   */
  private handleStatusChange(status: ConnectionStatus): void {
    this.connectionStatus = status;
    console.log(`Drive connection status changed to: ${status}`);
  }
  
  /**
   * Connect to Google Drive with improved error handling
   */
  async connectToDrive(clientId: string, apiKey: string, cachedToken?: string | null): Promise<boolean> {
    // Verify Google API is fully loaded before attempting to connect
    if (!this.config.apiLoader.isLoaded()) {
      console.log('MCP: Google API not fully loaded, attempting to load before connecting');
      try {
        const loaded = await this.config.apiLoader.ensureGoogleApiLoaded();
        if (!loaded) {
          console.error('MCP: Failed to load Google API');
          return false;
        }
      } catch (error) {
        console.error('MCP: Error loading Google API:', error);
        return false;
      }
    }
    
    // Verify GAPI client is available
    if (!this.config.apiLoader.getGapiClient()) {
      console.error('Google API client not available');
      return false;
    }
    
    try {
      // Log connection attempt
      console.log('MCP: Connecting to Google Drive with credentials:', { 
        clientId, 
        apiKeyLength: apiKey ? apiKey.length : 0 
      });
      
      const result = await this.authManager.connectToDrive(clientId, apiKey, cachedToken);
      
      // If connection was successful, set up monitoring
      if (result) {
        this.connectionMonitor.setupConnectionMonitoring();
      }
      
      return result;
    } catch (error) {
      console.error('MCP: Error connecting to Google Drive:', error);
      return false;
    }
  }
  
  /**
   * List documents from Drive
   */
  async listDocuments(folderId?: string): Promise<any[]> {
    return this.fileOperations.listDocuments(folderId);
  }
  
  /**
   * Fetch document content
   */
  async fetchDocumentContent(documentId: string): Promise<string | null> {
    return this.fileOperations.fetchDocumentContent(documentId);
  }
  
  /**
   * Check if connected to Google Drive
   */
  isConnectedToDrive(): boolean {
    return this.authManager.isConnectedToDrive();
  }
  
  /**
   * Get the current connection status
   */
  getConnectionStatus(): ConnectionStatus {
    return this.connectionStatus;
  }
  
  /**
   * Set authentication state
   */
  setAuthenticationState(state: boolean): void {
    this.authManager.setAuthenticationState(state);
  }
  
  /**
   * Clean up resources
   */
  cleanup(): void {
    this.connectionMonitor.cleanup();
  }
}

/**
 * Create drive operations
 */
export function createDriveOperations(config: DriveOperationsConfig): DriveOperations {
  return new DriveOperations(config);
}
