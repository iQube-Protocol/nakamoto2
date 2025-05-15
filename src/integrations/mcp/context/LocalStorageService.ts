
import { MCPContext } from '../types';
import { ContextStorageService, StorageOptions } from './types';

/**
 * Service for storing MCP context in browser's localStorage
 */
export class LocalStorageService implements ContextStorageService {
  private storage: Storage;
  private keyPrefix: string;
  
  constructor(options: StorageOptions = {}) {
    this.storage = options.storage || (typeof localStorage !== 'undefined' ? localStorage : null);
    this.keyPrefix = options.keyPrefix || 'mcp-context-';
    
    if (!this.storage) {
      console.warn('LocalStorage not available. Context persistence will not work.');
    }
  }
  
  /**
   * Save context to storage
   */
  saveContext(conversationId: string, context: MCPContext): void {
    if (!this.storage) {
      console.error('Cannot save context: Storage not available');
      return;
    }
    
    try {
      const key = `${this.keyPrefix}${conversationId}`;
      
      // First, verify document content integrity before saving
      if (context.documentContext && context.documentContext.length > 0) {
        const invalidDocs = context.documentContext.filter(doc => !doc.content || doc.content.length === 0);
        if (invalidDocs.length > 0) {
          console.warn(`⚠️ Attempting to save context with ${invalidDocs.length} invalid documents:`, 
            invalidDocs.map(d => d.documentName));
        }
        
        // Log document sizes for debugging
        const docSizes = context.documentContext.map(doc => ({
          name: doc.documentName,
          size: doc.content ? doc.content.length : 0
        }));
        console.log('Document sizes before storage:', docSizes);
      }
      
      // Serialize and save to storage
      const serialized = JSON.stringify(context);
      this.storage.setItem(key, serialized);
      
      // Verify that the context was saved correctly by reading it back
      const savedItem = this.storage.getItem(key);
      if (!savedItem) {
        throw new Error(`Context for ${conversationId} was not saved properly`);
      }
      
      // Verify that document content survived serialization
      const savedContext = JSON.parse(savedItem) as MCPContext;
      if (savedContext.documentContext && context.documentContext) {
        const originalDocCount = context.documentContext.length;
        const savedDocCount = savedContext.documentContext.length;
        
        if (originalDocCount !== savedDocCount) {
          console.error(`Document count mismatch after saving. Original: ${originalDocCount}, Saved: ${savedDocCount}`);
        } else {
          console.log(`Successfully saved context with ${savedDocCount} documents for conversation ${conversationId}`);
        }
        
        // Check content integrity
        let hasContentLoss = false;
        savedContext.documentContext.forEach((doc, i) => {
          const originalDoc = context.documentContext!.find(d => d.documentId === doc.documentId);
          if (originalDoc && originalDoc.content.length !== doc.content.length) {
            console.error(`Content length mismatch for document ${doc.documentName}. Original: ${originalDoc.content.length}, Saved: ${doc.content.length}`);
            hasContentLoss = true;
          }
        });
        
        if (hasContentLoss) {
          console.error('⚠️ Document content loss detected during save operation');
        }
      }
      
    } catch (error) {
      console.error('Error saving context to storage:', error);
      
      // Try with a smaller payload if the error might be related to storage limits
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.warn('Storage quota exceeded. Attempting to save without document content...');
        try {
          // Create a version without document content for fallback
          const minimalContext = { ...context };
          if (minimalContext.documentContext) {
            minimalContext.documentContext = minimalContext.documentContext.map(doc => ({
              ...doc,
              content: `[Content removed due to storage limitations. Document: ${doc.documentName}]`
            }));
          }
          
          const key = `${this.keyPrefix}${conversationId}`;
          this.storage.setItem(key, JSON.stringify(minimalContext));
          console.log('Saved context with reduced document content');
        } catch (fallbackError) {
          console.error('Failed to save even with reduced document content:', fallbackError);
        }
      }
    }
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
      
      // Verify document content integrity after loading
      if (parsedContext.documentContext && parsedContext.documentContext.length > 0) {
        console.log(`Loaded context with ${parsedContext.documentContext.length} documents for ${conversationId}`);
        
        // Check for empty document content
        const emptyDocs = parsedContext.documentContext.filter(doc => !doc.content || doc.content.length === 0);
        if (emptyDocs.length > 0) {
          console.warn(`⚠️ ${emptyDocs.length} documents have empty content after loading:`, 
            emptyDocs.map(d => d.documentName));
        }
        
        parsedContext.documentContext.forEach((doc, i) => {
          console.log(`Document ${i+1}: ${doc.documentName}, Content length: ${doc.content?.length || 0}`);
        });
      } else {
        console.log(`Loaded context for ${conversationId} without document context`);
      }
      
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
      
      // Verify deletion
      const itemExists = this.storage.getItem(key) !== null;
      if (itemExists) {
        console.warn(`Failed to remove context for ${conversationId} from storage`);
        return false;
      }
      
      console.log(`Successfully removed context for ${conversationId} from storage`);
      return true;
    } catch (error) {
      console.error('Error removing context from storage:', error);
      return false;
    }
  }
}
