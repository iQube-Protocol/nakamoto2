
import { MCPClientOptions, MCPContext, DocumentMetadata } from './types';
import { GoogleDriveService } from './GoogleDriveService';
import { ContextService } from './context';
import { MCPApiService } from './services/MCPApiService';
import { MCPDocumentService } from './services/MCPDocumentService';
import { toast } from 'sonner';

export { type MCPContext, type MCPClientOptions } from './types';

/**
 * Main MCP Client that coordinates Google Drive and Context services
 */
export class MCPClient {
  private apiService: MCPApiService;
  private contextService: ContextService;
  private driveService: GoogleDriveService;
  private documentService: MCPDocumentService;
  private initialized: boolean = false;
  
  constructor(options: MCPClientOptions = {}) {
    // Initialize services
    this.apiService = new MCPApiService(options.serverUrl, options.authToken);
    this.driveService = new GoogleDriveService();
    this.contextService = new ContextService(options.metisActive || false);
    this.documentService = new MCPDocumentService(this.driveService);
    
    console.log('MCP Client initialized with options:', {
      serverUrl: this.apiService.getServerUrl(),
      hasAuthToken: !!options.authToken,
      metisActive: options.metisActive
    });
  }
  
  /**
   * Initializes or retrieves the conversation context
   */
  async initializeContext(existingConversationId?: string): Promise<string> {
    const convId = await this.contextService.initializeContext(existingConversationId);
    this.initialized = true;
    return convId;
  }
  
  /**
   * Ensure the client is initialized
   */
  private async ensureInitialized(conversationId?: string): Promise<void> {
    if (!this.initialized && conversationId) {
      await this.initializeContext(conversationId);
    } else if (!this.initialized) {
      await this.initializeContext();
    }
  }
  
  /**
   * Add a user message to the context
   */
  async addUserMessage(message: string): Promise<void> {
    await this.ensureInitialized();
    return this.contextService.addUserMessage(message);
  }
  
  /**
   * Add an agent response to the context
   */
  async addAgentResponse(response: string): Promise<void> {
    await this.ensureInitialized();
    return this.contextService.addAgentResponse(response);
  }
  
  /**
   * Connect to Google Drive and authorize access
   */
  async connectToDrive(clientId: string, apiKey: string): Promise<boolean> {
    return this.driveService.connectToDrive(clientId, apiKey);
  }
  
  /**
   * Reset Google Drive connection
   */
  async resetDriveConnection(): Promise<boolean> {
    return this.driveService.resetDriveConnection();
  }
  
  /**
   * Load document metadata from Google Drive
   */
  async listDocuments(folderId?: string): Promise<DocumentMetadata[]> {
    return this.documentService.listDocuments(folderId);
  }
  
  /**
   * Fetch a specific document and add its content to the context
   */
  async fetchDocumentContent(documentId: string): Promise<string | null> {
    return this.documentService.fetchDocumentContent(documentId);
  }
  
  /**
   * Add document to MCP context
   */
  addDocumentToContext(
    documentId: string,
    documentName: string,
    documentType: string,
    content: string
  ): void {
    if (!this.initialized) {
      console.error("Cannot add document: MCP client not initialized");
      toast.error("MCP client not initialized");
      throw new Error("MCP client not initialized");
    }
    
    if (!content || content.length === 0) {
      console.error(`Cannot add document ${documentName}: Content is empty`);
      toast.error("Document content is empty", {
        description: `Cannot add document "${documentName}" with empty content`
      });
      throw new Error(`Document content is empty for ${documentName}`);
    }
    
    try {
      this.contextService.addDocumentToContext(
        documentId,
        documentName,
        documentType,
        content
      );
      
      // Verify the document was added successfully
      const context = this.getModelContext();
      const docInContext = context?.documentContext?.find(doc => doc.documentId === documentId);
      
      if (!docInContext) {
        console.error(`Document ${documentName} not found in context after adding!`);
        throw new Error(`Failed to add document ${documentName} to context`);
      }
      
      if (!docInContext.content || docInContext.content.length === 0) {
        console.error(`Document ${documentName} added but content is empty!`);
        throw new Error(`Document ${documentName} added with empty content`);
      }
      
      console.log(`Successfully added document ${documentName} to MCP context, content length: ${docInContext.content.length}`);
    } catch (error) {
      console.error(`Error adding document to context: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }
  
  /**
   * Remove document from MCP context
   */
  removeDocumentFromContext(documentId: string): boolean {
    if (!this.initialized) {
      console.warn("MCP client not initialized during document removal");
      return false;
    }
    
    return this.contextService.removeDocumentFromContext(documentId);
  }
  
  /**
   * Get the current context for use in AI models
   */
  getModelContext(): MCPContext | null {
    if (!this.initialized) {
      console.warn("Attempting to get model context before initialization");
      return null;
    }
    
    // Force refresh from storage to ensure we have latest
    this.contextService.refreshContextFromStorage();
    
    return this.contextService.getModelContext();
  }
  
  /**
   * Update model preferences in the context
   */
  setModelPreference(model: string): void {
    this.contextService.setModelPreference(model);
  }
  
  /**
   * Enable or disable Metis capabilities
   */
  setMetisActive(active: boolean): void {
    this.contextService.setMetisActive(active);
  }
  
  /**
   * Get the conversation ID
   */
  getConversationId(): string | null {
    return this.contextService.getConversationId();
  }
  
  /**
   * Set the authentication token
   */
  setAuthToken(token: string): void {
    this.apiService.setAuthToken(token);
  }
  
  /**
   * Set the server URL
   */
  setServerUrl(url: string): void {
    this.apiService.setServerUrl(url);
  }
  
  /**
   * Check whether client is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }
}

// Singleton instance for global use
let mcpClientInstance: MCPClient | null = null;

/**
 * Get the global MCP client instance
 */
export const getMCPClient = (options?: MCPClientOptions): MCPClient => {
  if (!mcpClientInstance) {
    console.log("Creating new MCP client instance");
    mcpClientInstance = new MCPClient(options);
  } else if (options) {
    // Update existing instance with new options if provided
    console.log("Updating existing MCP client instance with new options");
    if (options.serverUrl) mcpClientInstance.setServerUrl(options.serverUrl);
    if (options.authToken) mcpClientInstance.setAuthToken(options.authToken);
    if (options.metisActive !== undefined) mcpClientInstance.setMetisActive(options.metisActive);
  }
  
  return mcpClientInstance;
};
