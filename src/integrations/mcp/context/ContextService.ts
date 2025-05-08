
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
    
    this.context = this.documentManager.addDocumentToContext(
      this.context,
      documentId,
      documentName,
      documentType,
      content
    );
    
    this.persistContext();
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
    }
    
    return removed;
  }
  
  /**
   * Save context to persistence store
   */
  private persistContext(): void {
    if (this.context && this.conversationId) {
      this.storageService.saveContext(this.conversationId, this.context);
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
