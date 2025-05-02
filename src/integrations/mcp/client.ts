import { toast } from 'sonner';
import type { MCPClientOptions, MCPContext } from './types';
import { GoogleApiLoader } from './api-loader';
import { ContextManager } from './context-manager';
import { DriveOperations } from './drive-operations';

/**
 * Model Context Protocol Client for managing conversation context
 * and document interactions with Google Drive
 */
export class MCPClient {
  private conversationId: string | null = null;
  public serverUrl: string;
  private authToken: string | null;
  private apiLoader: GoogleApiLoader;
  private contextManager: ContextManager;
  private driveOperations: DriveOperations;
  
  constructor(options: MCPClientOptions = {}) {
    this.serverUrl = options.serverUrl || 'https://mcp-gdrive-server.example.com';
    this.authToken = options.authToken || null;
    
    // Initialize sub-modules
    this.apiLoader = new GoogleApiLoader(
      options.onApiLoadStart || null,
      options.onApiLoadComplete || null
    );
    
    this.contextManager = new ContextManager(options.metisActive || false);
    this.driveOperations = new DriveOperations(this.apiLoader, this.contextManager);
    
    console.log('MCP Client initialized with options:', {
      serverUrl: this.serverUrl,
      hasAuthToken: !!this.authToken,
      metisActive: options.metisActive || false
    });
  }
  
  /**
   * Initialize or retrieve the conversation context
   */
  async initializeContext(existingConversationId?: string): Promise<string> {
    const conversationId = await this.contextManager.initializeContext(existingConversationId);
    this.conversationId = conversationId;
    return conversationId;
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
   * Connect to Google Drive
   */
  async connectToDrive(clientId: string, apiKey: string, cachedToken?: string | null): Promise<boolean> {
    return this.driveOperations.connectToDrive(clientId, apiKey, cachedToken);
  }
  
  /**
   * List documents from Google Drive
   */
  async listDocuments(folderId?: string): Promise<any[]> {
    return this.driveOperations.listDocuments(folderId);
  }
  
  /**
   * Fetch document content
   */
  async fetchDocumentContent(documentId: string): Promise<string | null> {
    return this.driveOperations.fetchDocumentContent(documentId);
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
    this.contextManager.setMetisActive(active);
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
    return this.driveOperations.isConnectedToDrive();
  }
  
  // Public getter for api loader's callbacks to support existing code
  public get onApiLoadStart(): (() => void) | null {
    return this.apiLoader.onApiLoadStart;
  }
  
  public set onApiLoadStart(callback: (() => void) | null) {
    this.apiLoader.onApiLoadStart = callback;
  }
  
  public get onApiLoadComplete(): (() => void) | null {
    return this.apiLoader.onApiLoadComplete;
  }
  
  public set onApiLoadComplete(callback: (() => void) | null) {
    this.apiLoader.onApiLoadComplete = callback;
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
    
    // Handle API loading callbacks
    if (options.onApiLoadStart) {
      mcpClientInstance.onApiLoadStart = options.onApiLoadStart;
    }
    if (options.onApiLoadComplete) {
      mcpClientInstance.onApiLoadComplete = options.onApiLoadComplete;
    }
  }
  
  return mcpClientInstance;
};

// Re-export the types as type-only exports
export type { MCPContext, MCPClientOptions } from './types';
