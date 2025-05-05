
import { toast } from 'sonner';
import { 
  MCPContext, 
  MCPClientOptions, 
  MCPDocument, 
  MCPMessage 
} from './types';
import { 
  persistContext, 
  loadContext, 
  cleanupOldContexts 
} from './storage';
import { 
  connectToDrive as connectToDriveApi, 
  listDocuments as listDocumentsApi, 
  fetchDocumentContent as fetchDocumentContentApi 
} from './drive-api';

export class MCPClient {
  private conversationId: string | null = null;
  public serverUrl: string;
  private authToken: string | null;
  private metisActive: boolean;
  private context: MCPContext | null = null;
  private gapi: any = null;
  private tokenClient: any = null;
  private isApiLoaded: boolean = false;
  private isAuthenticated: boolean = false;
  
  constructor(options: MCPClientOptions = {}) {
    this.serverUrl = options.serverUrl || 'https://mcp-gdrive-server.example.com';
    this.authToken = options.authToken || null;
    this.metisActive = options.metisActive || false;
    
    console.log('MCP Client initialized with options:', {
      serverUrl: this.serverUrl,
      hasAuthToken: !!this.authToken,
      metisActive: this.metisActive
    });
    
    // Load Google API script if it's not already loaded
    this.loadGoogleApi();
  }
  
  /**
   * Load Google API script dynamically
   */
  private loadGoogleApi(): void {
    if (typeof window !== 'undefined' && !this.isApiLoaded) {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => this.onGapiLoaded();
      document.body.appendChild(script);
      
      const gsiScript = document.createElement('script');
      gsiScript.src = 'https://accounts.google.com/gsi/client';
      document.body.appendChild(gsiScript);
    }
  }
  
  /**
   * Callback when Google API script is loaded
   */
  private onGapiLoaded(): void {
    this.gapi = (window as any).gapi;
    this.gapi.load('client', () => {
      this.isApiLoaded = true;
      console.log('Google API client loaded');
    });
  }
  
  /**
   * Initializes or retrieves the conversation context
   */
  async initializeContext(existingConversationId?: string): Promise<string> {
    try {
      if (existingConversationId && this.conversationId !== existingConversationId) {
        console.log(`MCP: Loading existing conversation context: ${existingConversationId}`);
        // Try to fetch existing context from local storage
        const storedContext = loadContext(existingConversationId);
        
        if (storedContext) {
          this.context = storedContext;
          this.conversationId = existingConversationId;
          console.log(`MCP: Loaded local context for conversation ${existingConversationId}`);
          return existingConversationId;
        }
        
        // If not found locally, create a new one
        console.log(`MCP: Context not found for ${existingConversationId}, creating new`);
      }

      // Create new conversation context
      const newConversationId = existingConversationId || crypto.randomUUID();
      this.conversationId = newConversationId;
      
      this.context = {
        conversationId: newConversationId,
        messages: [],
        documentContext: [], // Initialize empty document context
        metadata: {
          environment: "web3_education",
          modelPreference: "gpt-4o-mini",
          metisActive: this.metisActive,
          source: 'google-drive'
        }
      };
      
      console.log(`MCP: Created new conversation context with ID: ${newConversationId}`);
      
      // Save the context
      this.persistContext();
      
      return newConversationId;
    } catch (error) {
      console.error('MCP: Error initializing context:', error);
      throw new Error(`MCP initialization error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Add a user message to the context
   */
  async addUserMessage(message: string): Promise<void> {
    if (!this.context || !this.conversationId) {
      await this.initializeContext();
    }
    
    if (this.context) {
      this.context.messages.push({
        role: 'user',
        content: message,
        timestamp: new Date().toISOString()
      });
      
      this.persistContext();
      console.log(`MCP: Added user message to context ${this.conversationId}`);
    }
  }
  
  /**
   * Add an agent response to the context
   */
  async addAgentResponse(response: string): Promise<void> {
    if (!this.context || !this.conversationId) {
      throw new Error('Cannot add agent response: Context not initialized');
    }
    
    this.context.messages.push({
      role: 'assistant',
      content: response,
      timestamp: new Date().toISOString()
    });
    
    this.persistContext();
    console.log(`MCP: Added agent response to context ${this.conversationId}`);
  }
  
  /**
   * Save context to persistence store
   */
  persistContext(): void {
    if (this.context && this.conversationId) {
      const success = persistContext(this.context, this.conversationId);
      
      if (!success) {
        console.error('MCP: Failed to persist context after multiple attempts');
      }
    }
  }
  
  /**
   * Connect to Google Drive and authorize access
   */
  async connectToDrive(clientId: string, apiKey: string): Promise<boolean> {
    if (!this.isApiLoaded) {
      console.log('Google API not loaded yet, waiting...');
      await new Promise((resolve) => {
        const checkApiLoaded = setInterval(() => {
          if (this.isApiLoaded) {
            clearInterval(checkApiLoaded);
            resolve(true);
          }
        }, 300);
      });
    }
    
    return connectToDriveApi(
      clientId, 
      apiKey, 
      this.gapi,
      (client) => { this.tokenClient = client; },
      (authenticated) => { this.isAuthenticated = authenticated; }
    );
  }
  
  /**
   * Load document metadata from Google Drive
   */
  async listDocuments(folderId?: string): Promise<any[]> {
    return listDocumentsApi(this.gapi, this.isAuthenticated, folderId);
  }
  
  /**
   * Fetch a specific document and add its content to the context
   */
  async fetchDocumentContent(documentId: string): Promise<string | null> {
    return fetchDocumentContentApi(
      documentId, 
      this.gapi, 
      this.isAuthenticated,
      (docData) => {
        // Add to context
        if (this.context) {
          if (!this.context.documentContext) {
            this.context.documentContext = [];
          }
          
          // Check if document already exists in context
          const existingDocIndex = this.context.documentContext.findIndex(doc => doc.documentId === documentId);
          
          if (existingDocIndex >= 0) {
            // Update existing document
            this.context.documentContext[existingDocIndex] = {
              ...docData,
              lastModified: new Date().toISOString()
            };
          } else {
            // Add new document
            this.context.documentContext.push({
              ...docData,
              lastModified: new Date().toISOString()
            });
          }
          
          // Save changes to context
          this.persistContext();
          console.log(`MCP: Added/updated document ${docData.documentName} to context`);
        }
      }
    );
  }
  
  /**
   * Get the current context for use in AI models
   */
  getModelContext(): MCPContext | null {
    return this.context;
  }
  
  /**
   * Update model preferences in the context
   */
  setModelPreference(model: string): void {
    if (this.context) {
      this.context.metadata.modelPreference = model;
      this.persistContext();
    }
  }
  
  /**
   * Enable or disable Metis capabilities
   */
  setMetisActive(active: boolean): void {
    this.metisActive = active;
    if (this.context) {
      this.context.metadata.metisActive = active;
      this.persistContext();
    }
  }
  
  /**
   * Get the conversation ID
   */
  getConversationId(): string | null {
    return this.conversationId;
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
   * Reset Google Drive connection
   */
  resetDriveConnection(): void {
    // Clear local storage
    localStorage.removeItem('gdrive-connected');
    
    // Set authenticated state to false
    this.isAuthenticated = false;
    
    console.log('MCP: Google Drive connection reset');
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

// Re-export types
export type { MCPContext, MCPClientOptions, MCPDocument, MCPMessage };
