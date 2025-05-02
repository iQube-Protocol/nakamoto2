
import { MCPContext, DocumentContext } from './types';

/**
 * Manages conversation context for the MCP client
 */
export class ContextManager {
  private context: MCPContext | null = null;
  private conversationId: string | null = null;
  
  /**
   * Initializes or retrieves the conversation context
   */
  public async initializeContext(existingConversationId?: string): Promise<string> {
    try {
      if (existingConversationId && this.conversationId !== existingConversationId) {
        console.log(`MCP: Loading existing conversation context: ${existingConversationId}`);
        // Try to fetch existing context from server or local storage
        const storedContext = localStorage.getItem(`mcp-context-${existingConversationId}`);
        if (storedContext) {
          try {
            this.context = JSON.parse(storedContext);
            this.conversationId = existingConversationId;
            console.log(`MCP: Loaded local context for conversation ${existingConversationId}`);
            console.log(`MCP: Context has ${this.context?.documentContext?.length || 0} documents`);
            
            // Ensure documentContext is initialized if it doesn't exist
            if (!this.context.documentContext) {
              this.context.documentContext = [];
            }
            
            return existingConversationId;
          } catch (error) {
            console.error('MCP: Error parsing stored context:', error);
          }
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
          metisActive: false,
          source: 'google-drive'
        },
        documentContext: [] // Initialize empty document array
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
  public async addUserMessage(message: string): Promise<void> {
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
  public async addAgentResponse(response: string): Promise<void> {
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
  public persistContext(): void {
    if (this.context && this.conversationId) {
      try {
        // Debug log context before saving
        if (this.context.documentContext) {
          console.log(`MCP: Persisting context with ${this.context.documentContext.length} documents:`, 
            this.context.documentContext.map(doc => doc.documentName).join(', '));
        }
        
        // Save to local storage for now (in production, would likely use Supabase or other DB)
        localStorage.setItem(`mcp-context-${this.conversationId}`, JSON.stringify(this.context));
        console.log(`MCP: Persisted context for ${this.conversationId} with ${this.context.documentContext?.length || 0} documents`);
      } catch (error) {
        console.error('MCP: Error persisting context:', error);
      }
    } else {
      console.warn('MCP: Cannot persist context: Context or conversationId missing');
    }
  }
  
  /**
   * Get the current context for use in AI models
   */
  public getModelContext(): MCPContext | null {
    return this.context;
  }
  
  /**
   * Update model preferences in the context
   */
  public setModelPreference(model: string): void {
    if (this.context) {
      this.context.metadata.modelPreference = model;
      this.persistContext();
    }
  }
  
  /**
   * Enable or disable Metis capabilities
   */
  public setMetisActive(active: boolean): void {
    if (this.context) {
      this.context.metadata.metisActive = active;
      this.persistContext();
    }
  }
  
  /**
   * Add document to context or update if it already exists
   */
  public addDocumentToContext(document: DocumentContext): void {
    if (!this.context) {
      console.error('MCP: Cannot add document to context: Context not initialized');
      return;
    }
    
    // Initialize documentContext if it doesn't exist
    if (!this.context.documentContext) {
      this.context.documentContext = [];
    }
    
    // Check if document already exists in context
    const existingDocIndex = this.context.documentContext.findIndex(
      doc => doc.documentId === document.documentId
    );
    
    if (existingDocIndex >= 0) {
      // Update existing document
      this.context.documentContext[existingDocIndex] = {
        ...document,
        lastModified: new Date().toISOString()
      };
      console.log(`MCP: Updated existing document in context: ${document.documentName}`);
    } else {
      // Add new document
      this.context.documentContext.push({
        ...document,
        lastModified: new Date().toISOString()
      });
      console.log(`MCP: Added new document to context: ${document.documentName}`);
    }
    
    // Debug log the current document context
    console.log(`MCP: Current document context has ${this.context.documentContext.length} documents:`);
    this.context.documentContext.forEach((doc, idx) => {
      console.log(`MCP: Document ${idx+1}: ${doc.documentName} (${doc.documentId})`);
    });
    
    this.persistContext();
  }
  
  /**
   * Get the conversation ID
   */
  public getConversationId(): string | null {
    return this.conversationId;
  }
  
  /**
   * Get document by ID from context
   */
  public getDocumentById(documentId: string): DocumentContext | undefined {
    if (this.context?.documentContext) {
      return this.context.documentContext.find(doc => doc.documentId === documentId);
    }
    return undefined;
  }
  
  /**
   * Check if context has documents
   */
  public hasDocuments(): boolean {
    return !!this.context?.documentContext && this.context.documentContext.length > 0;
  }
  
  /**
   * Get all documents in context
   */
  public getAllDocuments(): DocumentContext[] {
    if (this.context?.documentContext) {
      return [...this.context.documentContext];
    }
    return [];
  }
}
