
import { MCPContext } from '../types';
import { LocalStorageService } from './LocalStorageService';
import { DocumentManager } from './DocumentManager';
import { MessageManager } from './MessageManager';
import { ContextStorageService } from './types';
import { ContextEventManager } from './ContextEventManager';
import { ContextValidator } from './ContextValidator';
import { toast } from 'sonner';

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
  private documentFetchFunction: ((id: string) => Promise<string | null>) | null = null;
  
  constructor(metisActive: boolean = false, storageService?: ContextStorageService) {
    this.metisActive = metisActive;
    this.storageService = storageService || new LocalStorageService();
    this.documentManager = new DocumentManager();
    this.messageManager = new MessageManager();
    this.eventManager = new ContextEventManager();
    this.validator = new ContextValidator();
    
    console.log('Context service initialized with metisActive:', metisActive);
    
    // Set up document recovery listener
    if (typeof window !== 'undefined') {
      window.addEventListener('documentContentRecoveryNeeded', this.handleDocumentRecoveryEvent.bind(this));
      console.log('Document content recovery event listener registered');
    }
  }
  
  /**
   * Register a document fetch function for content recovery
   */
  registerDocumentFetchFunction(fetchFn: (id: string) => Promise<string | null>): void {
    this.documentFetchFunction = fetchFn;
    console.log('Document fetch function registered for content recovery');
  }
  
  /**
   * Handle document recovery event
   */
  private async handleDocumentRecoveryEvent(event: CustomEvent): Promise<void> {
    if (!this.context || !this.documentFetchFunction) return;
    
    const { documentId, documentName } = event.detail;
    console.log(`Processing recovery request for document ${documentName || documentId}`);
    
    try {
      this.context = await this.documentManager.fixDocumentContent(
        this.context,
        documentId,
        this.documentFetchFunction
      );
      
      // After recovery, persist the updated context
      this.persistContext();
    } catch (error) {
      console.error('Error during document content recovery:', error);
    }
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
          
          // Validate document context integrity
          const validationResult = this.validator.validateDocumentContext(this.context);
          if (!validationResult.valid) {
            console.warn(`⚠️ Document context has integrity issues. Attempting recovery...`);
            
            // Trigger recovery events for each invalid document
            this.scheduleDocumentContentRecovery(validationResult.invalidDocuments);
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
          source: 'google-drive',
          contextVersion: '2.0' // Mark as using new chunking system
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
   * Schedule recovery for invalid documents
   */
  private scheduleDocumentContentRecovery(invalidDocs: Array<{documentId: string, documentName: string, reason: string}>): void {
    if (!this.documentFetchFunction) {
      console.warn('Cannot recover document content: No fetch function registered');
      return;
    }
    
    // Process the invalid documents
    invalidDocs.forEach(doc => {
      // Create and dispatch a recovery event
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('documentContentRecoveryNeeded', { 
          detail: { 
            documentId: doc.documentId,
            documentName: doc.documentName,
            reason: doc.reason
          } 
        });
        
        // Use setTimeout to avoid blocking the main thread
        setTimeout(() => {
          window.dispatchEvent(event);
          console.log(`Recovery event dispatched for document ${doc.documentName}`);
        }, 500);
      }
    });
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
      
      // Validate context size before saving
      const validationResult = this.validator.validateBeforeSave(this.context);
      if (!validationResult.valid) {
        console.warn(`⚠️ Document context validation warning: Context size may exceed limits`);
        
        // Show warning to user if context is getting large
        if (validationResult.totalSize > 2 * 1024 * 1024) { // 2MB threshold
          toast.warning('Large document content may exceed storage limits', {
            description: 'Some document content might not be fully stored',
            duration: 5000
          });
        }
      }
      
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
    
    const result = this.documentManager.removeDocumentFromContext(this.context, documentId);
    
    if (result.removed) {
      this.context = result.context;
      this.persistContext();
      this.eventManager.dispatchDocumentEvent('removed', documentId, result.documentName);
    }
    
    return result.removed;
  }
  
  /**
   * Save context to persistence store
   */
  private persistContext(): void {
    if (this.context && this.conversationId) {
      try {
        // Validate before saving
        const validationResult = this.validator.validateBeforeSave(this.context);
        if (!validationResult.valid) {
          console.warn(`⚠️ Context validation before save found issues, but proceeding with save`);
        }
        
        this.storageService.saveContext(this.conversationId, this.context);
        console.log(`Context for ${this.conversationId} persisted to storage`);
        
        // Verify the save was successful by immediately reading it back
        this.verifyContextPersistence();
      } catch (error) {
        console.error('Error persisting context:', error);
        
        // Notify user of storage error
        toast.error('Error saving conversation context', {
          description: 'Some document content might not be properly stored'
        });
      }
    }
  }
  
  /**
   * Verify that the context was correctly persisted
   */
  private verifyContextPersistence(): void {
    if (!this.conversationId) return;
    
    try {
      // Read back the context to verify document content integrity
      const savedContext = this.storageService.loadContext(this.conversationId);
      
      if (!savedContext) {
        console.error('Context verification failed: saved context could not be loaded');
        return;
      }
      
      // Verify document count matches
      const originalDocCount = this.context?.documentContext?.length || 0;
      const savedDocCount = savedContext.documentContext?.length || 0;
      
      if (originalDocCount !== savedDocCount) {
        console.error(`Document count mismatch after saving. Original: ${originalDocCount}, Saved: ${savedDocCount}`);
        return;
      }
      
      // Verify document content for each document
      let contentIntegrity = true;
      if (savedContext.documentContext && this.context?.documentContext) {
        for (const savedDoc of savedContext.documentContext) {
          const originalDoc = this.context.documentContext.find(d => d.documentId === savedDoc.documentId);
          
          if (originalDoc) {
            // Check for chunked content marker
            if (typeof savedDoc.content === 'string' && savedDoc.content.startsWith('__CHUNKED__:')) {
              // Chunked content - content is stored separately, so this is expected
              console.log(`Document ${savedDoc.documentName} content is chunked`);
            } 
            // Check content length for non-chunked content
            else if (originalDoc.content.length !== savedDoc.content.length) {
              console.error(`Content length mismatch for document ${savedDoc.documentName}. ` +
                `Original: ${originalDoc.content.length}, Saved: ${savedDoc.content.length}`);
              contentIntegrity = false;
            }
          } else {
            console.error(`Original document not found for saved document ${savedDoc.documentName}`);
            contentIntegrity = false;
          }
        }
      }
      
      if (!contentIntegrity) {
        console.error('⚠️ Document content integrity issues detected after save');
      } else {
        console.log('Context persistence verification successful');
      }
    } catch (error) {
      console.error('Error verifying context persistence:', error);
    }
  }
  
  /**
   * Get the current context for use in AI models
   */
  getModelContext(): MCPContext | null {
    if (this.context) {
      // Verify document context integrity before returning
      const validationResult = this.validator.validateDocumentContext(this.context);
      
      if (!validationResult.valid) {
        console.warn(`⚠️ Document context integrity issues detected in getModelContext`);
        
        // Trigger recovery for invalid documents
        this.scheduleDocumentContentRecovery(validationResult.invalidDocuments);
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
        
        // Validate refreshed context
        const validationResult = this.validator.validateDocumentContext(this.context);
        if (!validationResult.valid) {
          console.warn(`⚠️ Refreshed context has integrity issues. Scheduling recovery...`);
          this.scheduleDocumentContentRecovery(validationResult.invalidDocuments);
        }
        
        return true;
      }
    } catch (error) {
      console.error('Error refreshing context from storage:', error);
    }
    
    return false;
  }
}
