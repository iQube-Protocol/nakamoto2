import { MCPContext } from '../types';
import { ContextStorageService, StorageOptions } from './types';

/**
 * Service for storing MCP context in browser's localStorage with quota management
 */
export class LocalStorageService implements ContextStorageService {
  private storage: Storage;
  private keyPrefix: string;
  private maxDocumentSize: number = 50000; // ~50KB max per document to avoid quota issues
  
  constructor(options: StorageOptions = {}) {
    this.storage = options.storage || (typeof localStorage !== 'undefined' ? localStorage : null);
    this.keyPrefix = options.keyPrefix || 'mcp-context-';
    
    if (!this.storage) {
      console.warn('LocalStorage not available. Context persistence will not work.');
    }
  }
  
  /**
   * Save context to storage with quota management
   */
  saveContext(conversationId: string, context: MCPContext): void {
    if (!this.storage) {
      console.error('Cannot save context: Storage not available');
      return;
    }
    
    try {
      // First, try to clear old data to free up space
      this.pruneOldContexts(conversationId);
      
      // Prepare context for storage - limit document content size
      const storableContext = this.prepareForStorage(context);
      const key = `${this.keyPrefix}${conversationId}`;
      
      // Serialize and save to storage
      const serialized = JSON.stringify(storableContext);
      this.storage.setItem(key, serialized);
      
      console.log(`Successfully saved context for conversation ${conversationId}`);
    } catch (error) {
      console.error('Error saving context to storage:', error);
      
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        this.handleQuotaExceeded(conversationId, context);
      }
    }
  }
  
  /**
   * Handle quota exceeded error by trimming content
   */
  private handleQuotaExceeded(conversationId: string, context: MCPContext): void {
    try {
      console.warn('Storage quota exceeded. Attempting emergency cleanup...');
      
      // Remove all other contexts
      this.clearAllContextsExcept(conversationId);
      
      // Create a minimal version of the context
      const minimalContext: MCPContext = {
        ...context,
        documentContext: context.documentContext ? 
          context.documentContext.map(doc => ({
            ...doc,
            content: doc.content ? doc.content.substring(0, 1000) + '...[truncated]' : ''
          })) : []
      };
      
      // Try to save the minimal context
      const key = `${this.keyPrefix}${conversationId}`;
      this.storage.setItem(key, JSON.stringify(minimalContext));
      console.log('Saved minimal context after quota exceeded');
    } catch (error) {
      console.error('Failed to save even minimal context:', error);
      // Clear all localStorage as last resort
      this.clearStorage();
    }
  }
  
  /**
   * Clear all stored contexts except the current one
   */
  private clearAllContextsExcept(currentId: string): void {
    try {
      const keysToRemove: string[] = [];
      
      // Find all context keys except the current one
      for (let i = 0; i < this.storage.length; i++) {
        const key = this.storage.key(i);
        if (key && key.startsWith(this.keyPrefix) && !key.endsWith(currentId)) {
          keysToRemove.push(key);
        }
      }
      
      // Remove them
      keysToRemove.forEach(key => this.storage.removeItem(key));
      console.log(`Cleared ${keysToRemove.length} old contexts to free space`);
    } catch (error) {
      console.error('Error clearing old contexts:', error);
    }
  }
  
  /**
   * Clear the oldest contexts to make room for new ones
   */
  private pruneOldContexts(currentId: string): void {
    try {
      // Keep only the 3 most recent contexts
      const contextKeys: {key: string, timestamp: number}[] = [];
      
      for (let i = 0; i < this.storage.length; i++) {
        const key = this.storage.key(i);
        if (key && key.startsWith(this.keyPrefix) && !key.endsWith(currentId)) {
          try {
            const content = this.storage.getItem(key);
            if (content) {
              const parsed = JSON.parse(content);
              const timestamp = parsed.timestamp || 0;
              contextKeys.push({key, timestamp});
            }
          } catch (e) {
            contextKeys.push({key, timestamp: 0}); // Can't parse, consider old
          }
        }
      }
      
      // Sort by timestamp (oldest first) and remove all but the 3 newest
      contextKeys.sort((a, b) => a.timestamp - b.timestamp);
      
      if (contextKeys.length > 3) {
        const toRemove = contextKeys.slice(0, contextKeys.length - 3);
        toRemove.forEach(item => this.storage.removeItem(item.key));
        console.log(`Pruned ${toRemove.length} old contexts`);
      }
    } catch (error) {
      console.error('Error pruning old contexts:', error);
    }
  }
  
  /**
   * Prepare context for storage by limiting document content size
   */
  private prepareForStorage(context: MCPContext): MCPContext {
    const prepared = {...context};
    
    // Add timestamp for pruning
    prepared.timestamp = Date.now();
    
    // Limit document content size
    if (prepared.documentContext && prepared.documentContext.length > 0) {
      prepared.documentContext = prepared.documentContext.map(doc => {
        if (doc.content && doc.content.length > this.maxDocumentSize) {
          return {
            ...doc,
            content: doc.content.substring(0, this.maxDocumentSize) + '...[content truncated to save space]'
          };
        }
        return doc;
      });
    }
    
    return prepared;
  }
  
  /**
   * Load context from storage
   */
  loadContext(conversationId: string): MCPContext | null {
    if (!this.storage) {
      console.error('Cannot load context: Storage not available');
      return null;
    }
    
    try {
      const key = `${this.keyPrefix}${conversationId}`;
      const storedContext = this.storage.getItem(key);
      
      if (!storedContext) {
        console.log(`No stored context found for conversation ${conversationId}`);
        return null;
      }
      
      const parsedContext = JSON.parse(storedContext) as MCPContext;
      
      // Update timestamp on load to mark recently accessed
      parsedContext.timestamp = Date.now();
      this.storage.setItem(key, JSON.stringify(parsedContext));
      
      console.log(`Loaded context for ${conversationId} with ${parsedContext.documentContext?.length || 0} documents`);
      return parsedContext;
    } catch (error) {
      console.error('Error loading context from storage:', error);
      return null;
    }
  }
  
  /**
   * Remove context from storage
   */
  removeContext(conversationId: string): boolean {
    if (!this.storage) {
      console.error('Cannot remove context: Storage not available');
      return false;
    }
    
    try {
      const key = `${this.keyPrefix}${conversationId}`;
      this.storage.removeItem(key);
      console.log(`Removed context for ${conversationId}`);
      return true;
    } catch (error) {
      console.error('Error removing context from storage:', error);
      return false;
    }
  }
  
  /**
   * Clear all storage (emergency use only)
   */
  private clearStorage(): void {
    try {
      // Only clear MCP-related items, not all localStorage
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < this.storage.length; i++) {
        const key = this.storage.key(i);
        if (key && key.startsWith(this.keyPrefix)) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => this.storage.removeItem(key));
      console.log(`Emergency cleanup: removed ${keysToRemove.length} items from localStorage`);
    } catch (error) {
      console.error('Failed to clear storage:', error);
    }
  }
}
