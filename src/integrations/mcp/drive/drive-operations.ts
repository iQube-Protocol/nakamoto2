
import { toast } from 'sonner';
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
    this.fileOperations = new FileOperations(
      config.apiLoader,
      config.contextManager,
      this.authManager
    );
    
    // Initialize connection monitor
    this.connectionMonitor = new ConnectionMonitor({
      authManager: this.authManager,
      onStatusChange: this.handleStatusChange.bind(this)
    });
    
    // Start monitoring connection
    this.connectionMonitor.setupConnectionMonitoring();
  }
  
  /**
   * Reset the connection state completely
   */
  resetConnection(): void {
    // Reset auth state with enhanced functionality
    this.authManager.resetAuth();
    
    // Full reset for API loader
    this.config.apiLoader.fullReset();
    
    // Stop connection monitoring temporarily
    this.connectionMonitor.stopMonitoring();
    
    // Clear any cached document data
    if (typeof sessionStorage !== 'undefined') {
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith('gdrive-')) {
          sessionStorage.removeItem(key);
        }
      });
    }
    
    // Restart monitoring after a short delay
    setTimeout(() => {
      this.connectionMonitor.setupConnectionMonitoring();
    }, 1000);
    
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
    try {
      // Show a loading toast
      toast.loading('Setting up Google Drive connection...', {
        id: 'drive-connect',
        duration: 15000
      });

      // Verify Google API is fully loaded before attempting to connect
      if (!this.config.apiLoader.isLoaded()) {
        console.log('MCP: Google API not fully loaded, attempting to load before connecting');
        try {
          const loaded = await this.config.apiLoader.ensureGoogleApiLoaded();
          if (!loaded) {
            toast.error('Failed to load Google API', {
              description: 'Please refresh the page and try again',
              duration: 4000,
              id: 'drive-connect-error',
            });
            return false;
          }
        } catch (error) {
          toast.error('Error loading Google API', {
            description: error instanceof Error ? error.message : 'Unknown error',
            duration: 4000,
            id: 'drive-connect-error',
          });
          return false;
        }
      }
      
      // Verify GAPI client is available
      if (!this.config.apiLoader.getGapiClient()) {
        toast.error('Google API client not available', {
          description: 'Please refresh the page and try again',
          duration: 4000,
          id: 'drive-connect-error',
        });
        return false;
      }
      
      // Log connection attempt
      console.log('MCP: Connecting to Google Drive with credentials:', { 
        clientId, 
        apiKeyLength: apiKey ? apiKey.length : 0 
      });
      
      const result = await this.authManager.connectToDrive(clientId, apiKey, cachedToken);
      
      if (result) {
        toast.dismiss('drive-connect');
        toast.success('Connected to Google Drive', {
          description: 'Your Google Drive documents are now available',
          duration: 3000,
          id: 'drive-connect-success',
        });
      } else {
        toast.dismiss('drive-connect');
        toast.error('Failed to connect to Google Drive', {
          description: 'Please check your credentials and try again',
          duration: 4000,
          id: 'drive-connect-error',
        });
      }
      
      return result;
    } catch (error) {
      console.error('MCP: Error connecting to Google Drive:', error);
      
      toast.dismiss('drive-connect');
      toast.error('Google Drive connection failed', { 
        description: error instanceof Error ? error.message : 'Unknown error',
        duration: 4000,
        id: 'drive-connect-error',
      });
      
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
