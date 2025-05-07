
import { MCPContext, MCPClientOptions } from './types';
import { GoogleApiLoader } from './googleApiLoader';
import { ContextManager } from './contextManager';
import { DriveService } from './driveService';
import { ConnectionManager } from './services/connectionManager';

export class MCPClient {
  private contextManager: ContextManager;
  private googleApiLoader: GoogleApiLoader;
  private driveService: DriveService;
  private connectionManager: ConnectionManager;
  public serverUrl: string;
  private authToken: string | null;
  private metisActive: boolean;
  
  constructor(options: MCPClientOptions = {}) {
    this.serverUrl = options.serverUrl || 'https://mcp-gdrive-server.example.com';
    this.authToken = options.authToken || null;
    this.metisActive = options.metisActive || false;
    
    // Initialize components with improved error handling
    this.googleApiLoader = new GoogleApiLoader({
      onApiLoadStart: options.onApiLoadStart,
      onApiLoadComplete: options.onApiLoadComplete
    });
    
    this.contextManager = new ContextManager();
    this.driveService = new DriveService(this.googleApiLoader);
    this.connectionManager = new ConnectionManager(this.googleApiLoader, this.driveService);
    
    console.log('MCP Client initialized with options:', {
      serverUrl: this.serverUrl,
      hasAuthToken: !!this.authToken,
      metisActive: this.metisActive
    });
    
    // Load Google API script with timeout handling
    this.loadGoogleApiWithRetry();
    
    // Check for existing connection
    if (localStorage.getItem('gdrive-connected') === 'true') {
      this.driveService.setAuthenticated(true);
    }
  }
  
  /**
   * Load Google API with retry mechanism
   */
  private loadGoogleApiWithRetry(retryCount = 0): void {
    this.connectionManager.loadGoogleApiWithRetry(retryCount);
  }
  
  /**
   * Initializes or retrieves the conversation context
   */
  async initializeContext(existingConversationId?: string): Promise<string> {
    return this.contextManager.initializeContext(existingConversationId);
  }
  
  /**
   * Add a user message to the context
   */
  async addUserMessage(message: string): Promise<void> {
    return this.contextManager.addUserMessage(message);
  }
  
  /**
   * Add an agent response to the context
   */
  async addAgentResponse(response: string): Promise<void> {
    return this.contextManager.addAgentResponse(response);
  }
  
  /**
   * Connect to Google Drive and authorize access with improved error handling
   */
  async connectToDrive(clientId: string, apiKey: string, cachedToken?: string | null): Promise<boolean> {
    return this.connectionManager.connectToDrive(clientId, apiKey, cachedToken);
  }
  
  /**
   * Load document metadata from Google Drive with timeout and error handling
   */
  async listDocuments(folderId?: string): Promise<any[]> {
    return this.connectionManager.listDocuments(folderId);
  }
  
  /**
   * Fetch a specific document and add its content to the context with improved error handling
   */
  async fetchDocumentContent(documentId: string): Promise<string | null> {
    return this.connectionManager.fetchDocumentContent(documentId, this.contextManager);
  }
  
  /**
   * Get the current context for use in AI models
   */
  getModelContext(): MCPContext | null {
    return this.contextManager.getModelContext();
  }
  
  /**
   * Update model preferences in the context
   */
  setModelPreference(model: string): void {
    this.contextManager.setModelPreference(model);
  }
  
  /**
   * Enable or disable Metis capabilities
   */
  setMetisActive(active: boolean): void {
    this.metisActive = active;
    this.contextManager.setMetisActive(active);
  }
  
  /**
   * Reset connection state
   */
  resetConnection(): void {
    this.connectionManager.resetConnection();
  }
  
  /**
   * Get the conversation ID
   */
  getConversationId(): string | null {
    return this.contextManager.getConversationId();
  }
  
  /**
   * Set the authentication token
   */
  setAuthToken(token: string): void {
    this.authToken = token;
  }
  
  /**
   * Set the server URL
   */
  setServerUrl(url: string): void {
    this.serverUrl = url;
  }
  
  /**
   * Check if connected to Google Drive
   */
  isConnectedToDrive(): boolean {
    return this.driveService.isConnectedToDrive() || localStorage.getItem('gdrive-connected') === 'true';
  }
}

// Singleton instance for global use
let mcpClientInstance: MCPClient | null = null;

/**
 * Get the global MCP client instance
 */
export const getMCPClient = (options?: MCPClientOptions): MCPClient => {
  if (!mcpClientInstance) {
    mcpClientInstance = new MCPClient(options);
  } else if (options) {
    // Update existing instance with new options if provided
    if (options.serverUrl) mcpClientInstance.setServerUrl(options.serverUrl);
    if (options.authToken) mcpClientInstance.setAuthToken(options.authToken);
    if (options.metisActive !== undefined) mcpClientInstance.setMetisActive(options.metisActive);
  }
  
  return mcpClientInstance;
};
