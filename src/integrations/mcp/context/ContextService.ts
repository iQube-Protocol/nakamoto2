
import { MCPContext } from '../types';
import { LocalStorageService } from './LocalStorageService';
import { DocumentManager } from './DocumentManager';
import { MessageManager } from './MessageManager';
import { ContextStorageService } from './types';

/**
 * Service for managing conversation context
 */
export class ContextService {
  private context: MCPContext | null = null;
  private conversationId: string | null = null;
  private metisActive: boolean;
  private storageService: ContextStorageService;
  private documentManager: DocumentManager;
  private messageManager: MessageManager;
  
  constructor(metisActive: boolean = false, storageService?: ContextStorageService) {
    this.metisActive = metisActive;
    this.storageService = storageService || new LocalStorageService();
    this.documentManager = new DocumentManager();
    this.messageManager = new MessageManager();
    
    console.log('Context service initialized with metisActive:', metisActive);
  }
  
  /**
   * Initializes or retrieves the conversation context
   */
  async initializeContext(existingConversationId?: string): Promise<string> {
    try {
      if (existingConversationId && this.conversationId !== existingConversationId) {
        console.log(`Loading existing conversation context: ${existingConversationId}`);
        
        // Try to fetch existing context from storage
        const storedContext = this.storageService.loadContext(existingConversationId);
        
        if (storedContext) {
          this.context = storedContext;
          this.conversationId = existingConversationId;
          console.log(`Loaded local context for conversation ${existingConversationId}`);
          
          // Log document context if available
          if (this.context.documentContext && this.context.documentContext.length > 0) {
            console.log(`Found ${this.context.documentContext.length} documents in stored context:`, 
              this.context.documentContext.map(doc => doc.documentName));
              
            // Verify document content integrity
            this.context.documentContext.forEach((doc, i) => {
              console.log(`Document ${i+1}: ${doc.documentName}, Content length: ${doc.content?.length || 0}`);
              if (!doc.content || doc.content.length === 0) {
                console.warn(`⚠️ Document ${doc.documentName} has no content! This will affect agent functionality.`);
              }
            });
          } else {
            console.log(`No documents found in stored context for conversation ${existingConversationId}`);
          }
          
          return existingConversationId;
        }
        
        // If not found locally, create a new one
        console.log(`Context not found for ${existingConversationId}, creating new`);
      }

      // Create new conversation context
      const newConversationId = existingConversationId || crypto.randomUUID();
      this.conversationId = newConversationId;
      
      this.context = {
        conversationId: newConversationId,
        messages: [],
        documentContext: [], // Initialize with empty array to avoid undefined
        metadata: {
          environment: "web3_education",
          modelPreference: "gpt-4o-mini",
          metisActive: this.metisActive,
          source: 'google-drive'
        }
      };
      
      console.log(`Created new conversation context with ID: ${newConversationId}`);
      
      // Save the context
      this.persistContext();
      
      return newConversationId;
    } catch (error) {
      console.error('Error initializing context:', error);
      throw new Error(`MCP initialization error: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
      this.context = this.messageManager.addUserMessage(this.context, message);
      this.persistContext();
      console.log(`Added user message to context ${this.conversationId}`);
    }
  }
  
  /**
   * Add an agent response to the context
   */
  async addAgentResponse(response: string): Promise<void> {
    if (!this.context || !this.conversationId) {
      throw new Error('Cannot add agent response: Context not initialized');
    }
    
    this.context = this.messageManager.addAgentResponse(this.context, response);
    this.persistContext();
    console.log(`Added agent response to context ${this.conversationId}`);
  }
  
  /**
   * Add document to context
   */
  addDocumentToContext(
    documentId: string,
    documentName: string,
    documentType: string,
    content: string
  ): void {
    if (!this.context) {
      throw new Error('Cannot add document: Context not initialized');
    }
    
    try {
      if (!content || content.length === 0) {
        throw new Error(`Cannot add document ${documentName}: Content is empty`);
      }
      
      this.context = this.documentManager.addDocumentToContext(
        this.context,
        documentId,
        documentName,
        documentType,
        content
      );
      
      this.persistContext();
      
      // Dispatch an event to notify that document context was updated
      try {
        if (typeof window !== 'undefined') {
          const event = new CustomEvent('documentContextUpdated', {
            detail: { documentId, documentName, action: 'added' }
          });
          window.dispatchEvent(event);
          console.log(`Event dispatched for document added: ${documentName}`);
        }
      } catch (eventError) {
        console.error('Error dispatching document context updated event:', eventError);
      }
      
      console.log(`Successfully added document ${documentName} to context. Content length: ${content.length}`);
    } catch (error) {
      console.error(`Failed to add document ${documentName} to context:`, error);
      throw error;
    }
  }
  
  /**
   * Remove document from context
   */
  removeDocumentFromContext(documentId: string): boolean {
    if (!this.context) {
      return false;
    }
    
    const { context, removed } = this.documentManager.removeDocumentFromContext(this.context, documentId);
    
    if (removed) {
      this.context = context;
      this.persistContext();
      
      // Dispatch an event to notify that document context was updated
      try {
        if (typeof window !== 'undefined') {
          const event = new CustomEvent('documentContextUpdated', {
            detail: { documentId, action: 'removed' }
          });
          window.dispatchEvent(event);
          console.log(`Event dispatched for document removed: ${documentId}`);
        }
      } catch (eventError) {
        console.error('Error dispatching document context updated event:', eventError);
      }
    }
    
    return removed;
  }
  
  /**
   * Save context to persistence store
   */
  private persistContext(): void {
    if (this.context && this.conversationId) {
      try {
        this.storageService.saveContext(this.conversationId, this.context);
        console.log(`Context for ${this.conversationId} persisted to storage`);
        
        // Debug log: check if documents are saved in the context
        if (this.context.documentContext && this.context.documentContext.length > 0) {
          console.log(`Saved context has ${this.context.documentContext.length} documents`);
          this.context.documentContext.forEach((doc, i) => {
            console.log(`Document ${i+1}: ${doc.documentName}, content length: ${doc.content.length}`);
          });
        }
      } catch (error) {
        console.error('Error persisting context:', error);
      }
    }
  }
  
  /**
   * Get the current context for use in AI models
   */
  getModelContext(): MCPContext | null {
    if (this.context) {
      // Verify document context integrity before returning
      if (this.context.documentContext && this.context.documentContext.length > 0) {
        console.log(`Getting model context with ${this.context.documentContext.length} documents`);
        const invalidDocs = this.context.documentContext.filter(doc => !doc.content || doc.content.length === 0);
        if (invalidDocs.length > 0) {
          console.warn(`⚠️ Found ${invalidDocs.length} documents with invalid content:`, 
            invalidDocs.map(d => d.documentName));
        }
      }
    }
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
   * Force refresh context from storage
   * This is useful if the context might have been updated from another tab
   */
  refreshContextFromStorage(): boolean {
    if (!this.conversationId) {
      return false;
    }
    
    try {
      const refreshedContext = this.storageService.loadContext(this.conversationId);
      if (refreshedContext) {
        this.context = refreshedContext;
        console.log(`Context refreshed from storage for ${this.conversationId}`);
        return true;
      }
    } catch (error) {
      console.error('Error refreshing context from storage:', error);
    }
    
    return false;
  }
}
