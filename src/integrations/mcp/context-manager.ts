
import { MCPContext } from './types';

/**
 * Manages conversation context and document storage
 */
export class ContextManager {
  private conversationId: string | null = null;
  private context: MCPContext | null = null;
  private metisActive: boolean = false;
  
  constructor(metisActive: boolean = false) {
    this.metisActive = metisActive;
  }
  
  /**
   * Initialize or retrieve the conversation context
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
   * Add document content to context
   */
  addDocumentToContext(documentId: string, documentName: string, documentType: string, content: string): void {
    if (!this.context) {
      throw new Error('Cannot add document: Context not initialized');
    }
    
    if (!this.context.documentContext) {
      this.context.documentContext = [];
    }
    
    // Check if document already exists in context
    const existingDocIndex = this.context.documentContext.findIndex(doc => doc.documentId === documentId);
    
    if (existingDocIndex >= 0) {
      // Update existing document
      this.context.documentContext[existingDocIndex] = {
        documentId,
        documentName,
        documentType,
        content,
        lastModified: new Date().toISOString()
      };
    } else {
      // Add new document
      this.context.documentContext.push({
        documentId,
        documentName,
        documentType,
        content,
        lastModified: new Date().toISOString()
      });
    }
    
    this.persistContext();
    console.log(`MCP: Added/updated document ${documentName} to context`);
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
}
