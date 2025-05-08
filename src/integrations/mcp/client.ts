
import { MCPClientOptions, MCPContext, DocumentMetadata } from './types';
import { GoogleDriveService } from './GoogleDriveService';
import { ContextService } from './context';
import { toast } from 'sonner';

export { type MCPContext, type MCPClientOptions } from './types';

/**
 * Main MCP Client that coordinates Google Drive and Context services
 */
export class MCPClient {
  public serverUrl: string;
  private authToken: string | null;
  private contextService: ContextService;
  private driveService: GoogleDriveService;
  
  constructor(options: MCPClientOptions = {}) {
    this.serverUrl = options.serverUrl || 'https://mcp-gdrive-server.example.com';
    this.authToken = options.authToken || null;
    this.contextService = new ContextService(options.metisActive || false);
    this.driveService = new GoogleDriveService();
    
    console.log('MCP Client initialized with options:', {
      serverUrl: this.serverUrl,
      hasAuthToken: !!this.authToken,
      metisActive: options.metisActive
    });
  }
  
  /**
   * Initializes or retrieves the conversation context
   */
  async initializeContext(existingConversationId?: string): Promise<string> {
    return this.contextService.initializeContext(existingConversationId);
  }
  
  /**
   * Add a user message to the context
   */
  async addUserMessage(message: string): Promise<void> {
    return this.contextService.addUserMessage(message);
  }
  
  /**
   * Add an agent response to the context
   */
  async addAgentResponse(response: string): Promise<void> {
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
    return this.driveService.listDocuments(folderId);
  }
  
  /**
   * Fetch a specific document and add its content to the context
   */
  async fetchDocumentContent(documentId: string): Promise<string | null> {
    try {
      // First get the file metadata
      const fileMetadata = await this.driveService.gapi.client.drive.files.get({
        fileId: documentId,
        fields: 'name,mimeType'
      });
      
      const fileName = fileMetadata.result.name;
      const mimeType = fileMetadata.result.mimeType;
      
      // Fetch the document content
      const documentContent = await this.driveService.fetchDocumentContent({
        id: documentId,
        name: fileName,
        mimeType: mimeType
      });
      
      return documentContent;
    } catch (error) {
      console.error(`Error fetching document ${documentId}:`, error);
      toast.error('Failed to fetch document', { 
        description: error instanceof Error ? error.message : 'Unknown error' 
      });
      return null;
    }
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
    this.contextService.addDocumentToContext(
      documentId,
      documentName,
      documentType,
      content
    );
  }
  
  /**
   * Remove document from MCP context
   */
  removeDocumentFromContext(documentId: string): boolean {
    return this.contextService.removeDocumentFromContext(documentId);
  }
  
  /**
   * Get the current context for use in AI models
   */
  getModelContext(): MCPContext | null {
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
    this.authToken = token;
  }
  
  /**
   * Set the server URL
   */
  setServerUrl(url: string): void {
    this.serverUrl = url;
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
