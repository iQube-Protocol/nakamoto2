
import { MCPContextData } from './types';
import { ContextPersistenceService } from './storage/context-persistence-service';
import { DocumentManager } from './context/document-manager';
import { MessageManager } from './context/message-manager';
import { MetadataManager } from './context/metadata-manager';

/**
 * Manages conversation context and document storage
 */
export class ContextManager {
  private conversationId: string | null = null;
  private context: MCPContextData | null = null;
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
        
        // Try to fetch existing context from local storage
        const storedContext = ContextPersistenceService.loadContext(existingConversationId);
        
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
    } catch (error: any) {
      console.error('MCP: Error initializing context:', error);
      throw new Error(`MCP initialization error: ${error.message}`);
    }
  }
  
  /**
   * Persist the current context to storage
   */
  persistContext(): void {
    if (!this.context || !this.conversationId) return;
    
    const success = ContextPersistenceService.persistContext(this.context);
    
    // If persistence fails, try cleaning up first
    if (!success) {
      ContextPersistenceService.cleanupOldItems(this.conversationId);
      ContextPersistenceService.persistContext(this.context);
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
      MessageManager.addUserMessage(this.context, message);
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
    
    MessageManager.addAgentResponse(this.context, response);
    this.persistContext();
    console.log(`MCP: Added agent response to context ${this.conversationId}`);
  }
  
  /**
   * Add document to the context
   */
  addDocument(documentId: string, documentName: string, documentType: string, content: string): void {
    if (!this.context) {
      throw new Error('Cannot add document: Context not initialized');
    }
    
    DocumentManager.addDocument(this.context, documentId, documentName, documentType, content);
    this.persistContext();
    console.log(`MCP: Added/updated document ${documentName} to context`);
  }
  
  /**
   * Remove document from context
   */
  removeDocument(documentId: string): void {
    if (!this.context) return;
    
    const removed = DocumentManager.removeDocument(this.context, documentId);
    
    if (removed) {
      this.persistContext();
      console.log(`MCP: Removed document ${documentId} from context`);
    }
  }
  
  /**
   * Clear all documents from context
   */
  clearDocuments(): void {
    if (!this.context) return;
    
    const cleared = DocumentManager.clearDocuments(this.context);
    
    if (cleared) {
      this.persistContext();
      console.log('MCP: Cleared all documents from context');
    }
  }
  
  /**
   * Get the document context
   */
  getDocumentContext(): Array<{
    documentId: string;
    documentName: string;
    documentType: string;
    content: string;
    lastModified?: string;
  }> | undefined {
    return this.context?.documentContext;
  }
  
  /**
   * Set conversation ID
   */
  setConversationId(id: string): void {
    this.conversationId = id;
    if (this.context) {
      this.context.conversationId = id;
      this.persistContext();
    }
  }
  
  /**
   * Add message to context
   */
  addMessage(role: string, content: string): void {
    if (!this.context) return;
    
    MessageManager.addMessage(this.context, role, content);
    this.persistContext();
  }
  
  /**
   * Clear all messages from context
   */
  clearMessages(): void {
    if (!this.context) return;
    
    const cleared = MessageManager.clearMessages(this.context);
    
    if (cleared) {
      this.persistContext();
    }
  }
  
  /**
   * Set user profile in context metadata
   */
  setUserProfile(userProfile: Record<string, any>): void {
    if (!this.context) return;
    
    MetadataManager.setUserProfile(this.context, userProfile);
    this.persistContext();
  }
  
  /**
   * Set metadata in context
   */
  setMetadata(metadata: Record<string, any>): void {
    if (!this.context) return;
    
    MetadataManager.setMetadata(this.context, metadata);
    this.persistContext();
  }
  
  /**
   * Get the current context
   */
  getContext(): MCPContextData {
    if (!this.context) {
      throw new Error('Context not initialized');
    }
    return this.context;
  }
  
  /**
   * Get the conversation ID
   */
  getConversationId(): string | null {
    return this.conversationId;
  }
  
  /**
   * Update model preferences in the context
   */
  setModelPreference(model: string): void {
    if (this.context) {
      MetadataManager.setModelPreference(this.context, model);
      this.persistContext();
    }
  }
  
  /**
   * Enable or disable Metis capabilities
   */
  setMetisActive(active: boolean): void {
    this.metisActive = active;
    if (this.context) {
      MetadataManager.setMetisActive(this.context, active);
      this.persistContext();
    }
  }
}
