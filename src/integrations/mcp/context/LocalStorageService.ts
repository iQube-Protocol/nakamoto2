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
   * Save context to storage with improved error handling and content verification
   */
  saveContext(conversationId: string, context: MCPContext): void {
    if (!this.storage) {
      console.error('Cannot save context: Storage not available');
      return;
    }
    
    try {
      const key = `${this.keyPrefix}${conversationId}`;
      
      // Add timestamp to context if not present
      const contextToSave = {
        ...context,
        timestamp: context.timestamp || new Date().toISOString()
      };
      
      // First, verify document content integrity before saving
      if (contextToSave.documentContext && contextToSave.documentContext.length > 0) {
        const invalidDocs = contextToSave.documentContext.filter(doc => !doc.content || doc.content.length === 0);
        if (invalidDocs.length > 0) {
          console.warn(`⚠️ Attempting to save context with ${invalidDocs.length} invalid documents:`, 
            invalidDocs.map(d => d.documentName));
        }
        
        // Log document sizes for debugging
        const docSizes = contextToSave.documentContext.map(doc => ({
          name: doc.documentName,
          size: doc.content ? doc.content.length : 0
        }));
        console.log('Document sizes before storage:', docSizes);
      }
      
      // First attempt: Try to save the full context
      try {
        // Serialize and save to storage
        const serialized = JSON.stringify(contextToSave);
        this.storage.setItem(key, serialized);
        
        // Verify that the context was saved correctly by reading it back
        const savedItem = this.storage.getItem(key);
        if (!savedItem) {
          throw new Error(`Context for ${conversationId} was not saved properly`);
        }
        
        // Log success message with details
        if (contextToSave.documentContext) {
          console.log(`Successfully saved context with ${contextToSave.documentContext.length} documents for conversation ${conversationId}`);
        } else {
          console.log(`Successfully saved context for conversation ${conversationId} (no documents)`);
        }
      } catch (error) {
        // Handle quota errors by creating a smaller version
        if (error instanceof DOMException && error.name === 'QuotaExceededError') {
          console.warn('Storage quota exceeded. Attempting to save with reduced document content...');
          
          // Create a lightweight version of the context
          const minimalContext = { ...contextToSave };
          
          if (minimalContext.documentContext) {
            // For each document, trim content to reduce size
            minimalContext.documentContext = minimalContext.documentContext.map(doc => {
              // Keep approximately first 50KB of each document to save space
              const maxLength = 50 * 1024; // 50KB
              const trimmedContent = doc.content.length > maxLength 
                ? doc.content.substring(0, maxLength) + `... [Content truncated, original length: ${doc.content.length}]`
                : doc.content;
              
              return {
                ...doc,
                content: trimmedContent
              };
            });
            
            // Try saving the reduced version
            try {
              const reducedSerialized = JSON.stringify(minimalContext);
              this.storage.setItem(key, reducedSerialized);
              console.log('Saved context with reduced document content');
            } catch (fallbackError) {
              console.error('Failed to save even with reduced document content:', fallbackError);
              
              // Last resort: try without documents
              try {
                const noDocsContext = { 
                  ...contextToSave, 
                  documentContext: contextToSave.documentContext?.map(doc => ({
                    ...doc,
                    content: `[Content removed due to storage limitations. Document: ${doc.documentName}]`
                  }))
                };
                this.storage.setItem(key, JSON.stringify(noDocsContext));
                console.warn('Saved context with document references only (no content)');
              } catch (lastError) {
                console.error('All attempts to save context failed:', lastError);
              }
            }
          } else {
            console.error('Failed to save context and no document content to trim:', error);
          }
        } else {
          console.error('Error saving context to storage:', error);
        }
      }
    } catch (error) {
      console.error('Unexpected error in saveContext:', error);
    }
  }
  
  /**
   * Load context from storage with improved validation
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
        
        // Log document content lengths for debugging
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
   * Remove context from storage with verification
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
