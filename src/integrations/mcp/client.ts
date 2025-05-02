
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface MCPContext {
  conversationId: string;
  documentContext?: {
    documentId: string;
    documentName: string;
    documentType: string;
    content: string;
    summary?: string;
    lastModified?: string;
  }[];
  messages: Array<{
    role: string;
    content: string;
    timestamp: string;
  }>;
  metadata: {
    userProfile?: Record<string, any>;
    environment?: string;
    modelPreference?: string;
    source?: 'google-drive' | 'local' | 'other';
    metisActive?: boolean;
  };
}

export interface MCPClientOptions {
  serverUrl?: string;
  authToken?: string;
  metisActive?: boolean;
}

export class MCPClient {
  private conversationId: string | null = null;
  private serverUrl: string;
  private authToken: string | null;
  private metisActive: boolean;
  private context: MCPContext | null = null;
  
  constructor(options: MCPClientOptions = {}) {
    this.serverUrl = options.serverUrl || 'https://mcp-gdrive-server.example.com';
    this.authToken = options.authToken || null;
    this.metisActive = options.metisActive || false;
    
    console.log('MCP Client initialized with options:', {
      serverUrl: this.serverUrl,
      hasAuthToken: !!this.authToken,
      metisActive: this.metisActive
    });
  }
  
  /**
   * Initializes or retrieves the conversation context
   */
  async initializeContext(existingConversationId?: string): Promise<string> {
    try {
      if (existingConversationId && this.conversationId !== existingConversationId) {
        console.log(`MCP: Loading existing conversation context: ${existingConversationId}`);
        // Try to fetch existing context from server or local storage
        const storedContext = localStorage.getItem(`mcp-context-${existingConversationId}`);
        if (storedContext) {
          this.context = JSON.parse(storedContext);
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
      throw new Error(`MCP initialization error: ${error.message}`);
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
  private persistContext(): void {
    if (this.context && this.conversationId) {
      try {
        // Save to local storage for now (in production, would likely use Supabase or other DB)
        localStorage.setItem(`mcp-context-${this.conversationId}`, JSON.stringify(this.context));
      } catch (error) {
        console.error('MCP: Error persisting context:', error);
      }
    }
  }
  
  /**
   * Connect to Google Drive and authorize access
   */
  async connectToDrive(clientId: string, apiKey: string): Promise<boolean> {
    console.log('MCP: Attempting to connect to Google Drive');
    
    try {
      // In a real implementation, this would initialize the Google Drive API client
      // and handle OAuth flow to get access to the user's Google Drive
      
      // For demonstration purposes:
      toast.success('Connected to Google Drive MCP Server', {
        description: 'Your Google Drive documents are now available to the AI agents'
      });
      
      return true;
    } catch (error) {
      console.error('MCP: Error connecting to Google Drive:', error);
      toast.error('Google Drive connection failed', { description: error.message });
      return false;
    }
  }
  
  /**
   * Load document metadata from Google Drive
   */
  async listDocuments(folderId?: string, pageSize = 10): Promise<any[]> {
    console.log(`MCP: Listing documents${folderId ? ' in folder ' + folderId : ''}`);
    
    // Simulated response - in production, would query Google Drive API
    return [
      { id: 'doc1', name: 'Web3 Introduction.pdf', mimeType: 'application/pdf' },
      { id: 'doc2', name: 'DeFi Strategies.docx', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
      { id: 'doc3', name: 'NFT Market Analysis.txt', mimeType: 'text/plain' }
    ];
  }
  
  /**
   * Fetch a specific document and add its content to the context
   */
  async fetchDocumentContent(documentId: string): Promise<string | null> {
    console.log(`MCP: Fetching document content for ${documentId}`);
    
    try {
      // In production, would fetch the actual document content via Google Drive API
      const documentContent = "This is simulated document content for document " + documentId;
      
      // Add to context
      if (this.context) {
        if (!this.context.documentContext) {
          this.context.documentContext = [];
        }
        
        this.context.documentContext.push({
          documentId,
          documentName: `Document-${documentId}.pdf`, // Would get real name from Drive API
          documentType: 'pdf', // Would get real type from Drive API
          content: documentContent,
          lastModified: new Date().toISOString()
        });
        
        this.persistContext();
      }
      
      return documentContent;
    } catch (error) {
      console.error(`MCP: Error fetching document ${documentId}:`, error);
      return null;
    }
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
    if (options.serverUrl) mcpClientInstance.serverUrl = options.serverUrl;
    if (options.authToken) mcpClientInstance.setAuthToken(options.authToken);
    if (options.metisActive !== undefined) mcpClientInstance.setMetisActive(options.metisActive);
  }
  
  return mcpClientInstance;
};
