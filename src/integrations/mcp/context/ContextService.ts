
import { MCPContext } from '../types';
import { LocalStorageService } from './LocalStorageService';
import { DocumentManager } from './DocumentManager';
import { MessageManager } from './MessageManager';
import { ContextStorageService } from './types';
import { ContextEventManager } from './ContextEventManager';
import { ContextValidator } from './ContextValidator';

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
  private eventManager: ContextEventManager;
  private validator: ContextValidator;
  
  constructor(metisActive: boolean = false, storageService?: ContextStorageService) {
    this.metisActive = metisActive;
    this.storageService = storageService || new LocalStorageService();
    this.documentManager = new DocumentManager();
    this.messageManager = new MessageManager();
    this.eventManager = new ContextEventManager();
    this.validator = new ContextValidator();
    
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
          
          // Validate document context if available
          this.validator.validateDocumentContext(this.context);
          
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
      this.eventManager.dispatchDocumentEvent('added', documentId, documentName);
      
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
    
    const { context, removed, documentName } = this.documentManager.removeDocumentFromContext(this.context, documentId);
    
    if (removed) {
      this.context = context;
      this.persistContext();
      this.eventManager.dispatchDocumentEvent('removed', documentId, documentName);
    }
    
    return removed;
  }
  
  /**
   * Save context to persistence store
   */
  private persistContext(): void {
    if (this.context && this.conversationId) {
      try {
        // Validate before saving
        this.validator.validateBeforeSave(this.context);
        
        this.storageService.saveContext(this.conversationId, this.context);
        console.log(`Context for ${this.conversationId} persisted to storage`);
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
      this.validator.validateDocumentContext(this.context);
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
