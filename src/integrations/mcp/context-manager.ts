
import { MCPContext, MCPContextData } from './types';

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
        // Try to fetch existing context from server or local storage
        const storedContext = this.safelyGetItem(`mcp-context-${existingConversationId}`);
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
    } catch (error: any) {
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
   * Add document to the context
   */
  addDocument(documentId: string, documentName: string, documentType: string, content: string): void {
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
   * Remove document from context
   */
  removeDocument(documentId: string): void {
    if (!this.context || !this.context.documentContext) return;
    
    const initialLength = this.context.documentContext.length;
    this.context.documentContext = this.context.documentContext.filter(doc => doc.documentId !== documentId);
    
    if (this.context.documentContext.length < initialLength) {
      this.persistContext();
      console.log(`MCP: Removed document ${documentId} from context`);
    }
  }
  
  /**
   * Clear all documents from context
   */
  clearDocuments(): void {
    if (!this.context) return;
    
    if (this.context.documentContext && this.context.documentContext.length > 0) {
      this.context.documentContext = [];
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
    
    this.context.messages.push({
      role,
      content,
      timestamp: new Date().toISOString()
    });
    
    this.persistContext();
  }
  
  /**
   * Clear all messages from context
   */
  clearMessages(): void {
    if (!this.context) return;
    
    if (this.context.messages.length > 0) {
      this.context.messages = [];
      this.persistContext();
    }
  }
  
  /**
   * Set user profile in context metadata
   */
  setUserProfile(userProfile: Record<string, any>): void {
    if (!this.context) return;
    
    this.context.metadata.userProfile = userProfile;
    this.persistContext();
  }
  
  /**
   * Set metadata in context
   */
  setMetadata(metadata: Record<string, any>): void {
    if (!this.context) return;
    
    this.context.metadata = {
      ...this.context.metadata,
      ...metadata
    };
    
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
   * Save context to persistence store with improved error handling
   */
  persistContext(): void {
    if (this.context && this.conversationId) {
      try {
        // Try to save the full context
        const key = `mcp-context-${this.conversationId}`;
        const contextString = JSON.stringify(this.context);
        
        // First try to save the whole context
        this.safelySetItem(key, contextString);
      } catch (error) {
        console.warn('MCP: Error persisting full context:', error);
        this.tryPersistingMinimalContext();
      }
    }
  }
  
  /**
   * Fallback method to save a minimal version of the context
   * when localStorage quota is exceeded
   */
  private tryPersistingMinimalContext(): void {
    if (!this.context || !this.conversationId) return;
    
    try {
      // Create a minimal version of the context without document content
      const minimalContext: MCPContextData = {
        conversationId: this.context.conversationId,
        messages: this.context.messages.slice(-10), // Keep only the last 10 messages
        metadata: this.context.metadata
      };
      
      // If there are documents, keep their references but not content
      if (this.context.documentContext) {
        minimalContext.documentContext = this.context.documentContext.map(doc => ({
          documentId: doc.documentId,
          documentName: doc.documentName,
          documentType: doc.documentType,
          content: '', // Don't store content
          lastModified: doc.lastModified
        }));
      }
      
      const key = `mcp-context-minimal-${this.conversationId}`;
      const minimalContextString = JSON.stringify(minimalContext);
      
      this.safelySetItem(key, minimalContextString);
      console.log('MCP: Stored minimal context due to storage limitations');
    } catch (error) {
      // If even minimal context fails, just log the error
      console.error('MCP: Failed to store even minimal context:', error);
    }
  }
  
  /**
   * Safely get an item from localStorage with error handling
   */
  private safelyGetItem(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error(`MCP: Error reading from localStorage for key ${key}:`, error);
      return null;
    }
  }
  
  /**
   * Safely set an item in localStorage with error handling
   */
  private safelySetItem(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      // Try cleaning up old items first
      this.cleanupOldItems();
      
      try {
        // Try again after cleanup
        localStorage.setItem(key, value);
      } catch (innerError) {
        throw new Error(`Failed to save to localStorage: ${innerError instanceof Error ? innerError.message : 'Unknown error'}`);
      }
    }
  }
  
  /**
   * Clean up old localStorage items to free up space
   */
  private cleanupOldItems(): void {
    try {
      // Find keys that start with 'mcp-context-'
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('mcp-context-') && key !== `mcp-context-${this.conversationId}`) {
          keysToRemove.push(key);
        }
      }
      
      // Sort by creation time (oldest first), limit to removing 5 oldest items
      keysToRemove.sort().slice(0, 5).forEach(key => {
        localStorage.removeItem(key);
        console.log(`MCP: Removed old context: ${key}`);
      });
    } catch (error) {
      console.error('MCP: Error cleaning up localStorage:', error);
    }
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
}
