import { ConnectionStatus, DriveOperationsConfig } from './types';
import { AuthManager } from './auth-manager';
import { ConnectionMonitor } from './connection-monitor';
import { FileOperations } from './file-operations';
import { GoogleApiLoader } from '../api/google-api-loader';
import { ContextManager } from '../context-manager';

/**
 * Manages operations with Google Drive
 */
export class DriveOperations {
  private apiLoader: GoogleApiLoader;
  private contextManager: ContextManager;
  private authManager: AuthManager;
  private connectionMonitor: ConnectionMonitor;
  private fileOperations: FileOperations;
  
  constructor(apiLoader: GoogleApiLoader, contextManager: ContextManager) {
    this.apiLoader = apiLoader;
    this.contextManager = contextManager;
    
    // Initialize managers
    this.authManager = new AuthManager(apiLoader);
    this.connectionMonitor = new ConnectionMonitor(this.authManager);
    this.fileOperations = new FileOperations(apiLoader, contextManager, this.authManager);
    
    // Setup connection monitoring
    this.connectionMonitor.setupConnectionMonitoring();
  }
  
  /**
   * Connect to Google Drive with improved error handling
   */
  async connectToDrive(clientId: string, apiKey: string, cachedToken?: string | null): Promise<boolean> {
    // Verify Google API is fully loaded before attempting to connect
    if (!this.apiLoader.isLoaded()) {
      console.log('MCP: Google API not fully loaded, attempting to load before connecting');
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
    
    // Verify GAPI client is available
    if (!this.apiLoader.getGapiClient()) {
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
    return this.authManager.getConnectionStatus();
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
 * Factory function to create a new DriveOperations instance
 */
export function createDriveOperations(config: DriveOperationsConfig): DriveOperations {
  return new DriveOperations(config.apiLoader, config.contextManager);
}
