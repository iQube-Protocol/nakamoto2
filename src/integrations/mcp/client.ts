
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { MCPContext, MCPClientOptions } from './types';
import { GoogleApiLoader } from './googleApiLoader';
import { ContextManager } from './contextManager';
import { DriveService } from './driveService';

export class MCPClient {
  private contextManager: ContextManager;
  private googleApiLoader: GoogleApiLoader;
  private driveService: DriveService;
  public serverUrl: string;
  private authToken: string | null;
  private metisActive: boolean;
  
  constructor(options: MCPClientOptions = {}) {
    this.serverUrl = options.serverUrl || 'https://mcp-gdrive-server.example.com';
    this.authToken = options.authToken || null;
    this.metisActive = options.metisActive || false;
    
    // Initialize components
    this.googleApiLoader = new GoogleApiLoader({
      onApiLoadStart: options.onApiLoadStart,
      onApiLoadComplete: options.onApiLoadComplete
    });
    this.contextManager = new ContextManager();
    this.driveService = new DriveService(this.googleApiLoader);
    
    console.log('MCP Client initialized with options:', {
      serverUrl: this.serverUrl,
      hasAuthToken: !!this.authToken,
      metisActive: this.metisActive
    });
    
    // Load Google API script if it's not already loaded
    this.googleApiLoader.loadGoogleApi();
    
    // Check for existing connection
    if (localStorage.getItem('gdrive-connected') === 'true') {
      this.driveService.setAuthenticated(true);
    }
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
   * Connect to Google Drive and authorize access
   */
  async connectToDrive(clientId: string, apiKey: string, cachedToken?: string | null): Promise<boolean> {
    return this.driveService.connectToDrive(clientId, apiKey, cachedToken);
  }
  
  /**
   * Load document metadata from Google Drive
   */
  async listDocuments(folderId?: string): Promise<any[]> {
    return this.driveService.listDocuments(folderId);
  }
  
  /**
   * Fetch a specific document and add its content to the context
   */
  async fetchDocumentContent(documentId: string): Promise<string | null> {
    const result = await this.driveService.fetchDocumentContent(documentId);
    
    if (!result) return null;
    
    // Add to context
    this.contextManager.addDocumentToContext({
      documentId,
      documentName: result.fileName,
      documentType: result.documentType,
      content: result.content
    });
    
    return result.content;
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
