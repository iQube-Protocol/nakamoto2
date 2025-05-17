
import { MCPContext } from '../types';
import { ContextStorageService, StorageOptions } from './types';

/**
 * Service for storing MCP context in browser's localStorage
 * Enhanced with chunking capabilities for large documents
 */
export class LocalStorageService implements ContextStorageService {
  private storage: Storage;
  private keyPrefix: string;
  private chunkPrefix: string;
  private chunkSize: number;
  
  constructor(options: StorageOptions = {}) {
    this.storage = options.storage || (typeof localStorage !== 'undefined' ? localStorage : null);
    this.keyPrefix = options.keyPrefix || 'mcp-context-';
    this.chunkPrefix = 'mcp-chunk-';
    this.chunkSize = options.chunkSize || 500000; // ~500KB chunks to stay under localStorage limits
    
    if (!this.storage) {
      console.warn('LocalStorage not available. Context persistence will not work.');
    }
  }
  
  /**
   * Save context to storage with document chunking
   */
  saveContext(conversationId: string, context: MCPContext): void {
    if (!this.storage) {
      console.error('Cannot save context: Storage not available');
      return;
    }
    
    try {
      const key = `${this.keyPrefix}${conversationId}`;
      console.log(`Starting context save for conversation ${conversationId}`);
      
      // Process documents that need chunking
      if (context.documentContext && context.documentContext.length > 0) {
        // Verify document content integrity before saving
        const docSizes = context.documentContext.map(doc => ({
          id: doc.documentId,
          name: doc.documentName,
          size: doc.content ? doc.content.length : 0
        }));
        
        console.log('Document sizes before storage:', docSizes);
        
        // Create a deep copy to avoid modifying the original
        const contextToSave = JSON.parse(JSON.stringify(context));
        
        // Process each document and chunk if necessary
        for (let i = 0; i < contextToSave.documentContext.length; i++) {
          const doc = contextToSave.documentContext[i];
          
          // Verify content exists
          if (!doc.content || doc.content.length === 0) {
            console.warn(`⚠️ Document ${doc.documentName} has empty content before save`);
            continue;
          }
          
          // If content is large, chunk it
          if (doc.content.length > this.chunkSize) {
            console.log(`Chunking large document: ${doc.documentName} (${doc.content.length} chars)`);
            
            // Store chunks separately
            const chunkCount = Math.ceil(doc.content.length / this.chunkSize);
            const chunkIds = [];
            
            for (let j = 0; j < chunkCount; j++) {
              const chunkId = `${this.chunkPrefix}${conversationId}-${doc.documentId}-${j}`;
              const start = j * this.chunkSize;
              const end = Math.min(start + this.chunkSize, doc.content.length);
              const chunk = doc.content.substring(start, end);
              
              // Store chunk
              this.storage.setItem(chunkId, chunk);
              chunkIds.push(chunkId);
              console.log(`Saved chunk ${j+1}/${chunkCount} for document ${doc.documentName}`);
            }
            
            // Replace content with reference to chunks
            contextToSave.documentContext[i].content = `__CHUNKED__:${chunkIds.join(',')}`;
            console.log(`Document ${doc.documentName} chunked into ${chunkCount} parts`);
          }
        }
        
        // Save the modified context
        this.storage.setItem(key, JSON.stringify(contextToSave));
        console.log(`Context saved for conversation ${conversationId} with ${contextToSave.documentContext.length} documents`);
      } else {
        // No documents, save as is
        this.storage.setItem(key, JSON.stringify(context));
        console.log(`Context saved for conversation ${conversationId} (no documents)`);
      }
    } catch (error) {
      console.error('Error saving context to storage:', error);
      
      // Try with a smaller payload as fallback
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        this.handleStorageQuotaExceeded(conversationId, context);
      }
    }
  }
  
  /**
   * Fallback handling for quota exceeded errors
   */
  private handleStorageQuotaExceeded(conversationId: string, context: MCPContext): void {
    console.warn('Storage quota exceeded. Attempting to save metadata only...');
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
      console.log('Saved context with reduced document content (metadata only)');
      
      // Set a flag to indicate incomplete storage
      this.storage.setItem(`${this.keyPrefix}${conversationId}-incomplete`, 'true');
    } catch (fallbackError) {
      console.error('Failed to save even with reduced document content:', fallbackError);
    }
  }
  
  /**
   * Load context from storage with chunk reassembly
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
      console.log(`Loaded raw context for ${conversationId}`);
      
      // Check if this was an incomplete save
      const isIncomplete = this.storage.getItem(`${this.keyPrefix}${conversationId}-incomplete`) === 'true';
      if (isIncomplete) {
        console.warn(`⚠️ Loading incomplete context for ${conversationId} (storage quota was exceeded during save)`);
      }
      
      // Reassemble chunked documents
      if (parsedContext.documentContext && parsedContext.documentContext.length > 0) {
        console.log(`Processing ${parsedContext.documentContext.length} documents from storage`);
        
        for (let i = 0; i < parsedContext.documentContext.length; i++) {
          const doc = parsedContext.documentContext[i];
          
          // Check if this document was chunked
          if (doc.content && typeof doc.content === 'string' && doc.content.startsWith('__CHUNKED__:')) {
            const chunkIds = doc.content.substring(11).split(',');
            console.log(`Reassembling ${chunkIds.length} chunks for document ${doc.documentName}`);
            
            let fullContent = '';
            let missingChunks = false;
            
            // Reassemble content from chunks
            for (let j = 0; j < chunkIds.length; j++) {
              const chunkId = chunkIds[j];
              const chunk = this.storage.getItem(chunkId);
              
              if (chunk) {
                fullContent += chunk;
              } else {
                console.error(`Missing chunk ${j+1}/${chunkIds.length} for document ${doc.documentName}`);
                missingChunks = true;
                break;
              }
            }
            
            if (!missingChunks) {
              parsedContext.documentContext[i].content = fullContent;
              console.log(`Successfully reassembled document ${doc.documentName} (${fullContent.length} chars)`);
            } else {
              parsedContext.documentContext[i].content = `[Error: Some document chunks are missing for ${doc.documentName}]`;
              console.error(`Failed to reassemble document ${doc.documentName} due to missing chunks`);
            }
          }
          
          // Verify content integrity after loading
          if (!doc.content || doc.content.length === 0) {
            console.warn(`⚠️ Document ${doc.documentName} has empty content after loading`);
          }
        }
      }
      
      return parsedContext;
    } catch (error) {
      console.error('Error loading context from storage:', error);
      return null;
    }
  }
  
  /**
   * Remove context and all associated chunks from storage
   */
  removeContext(conversationId: string): boolean {
    if (!this.storage) {
      console.error('Cannot remove context: Storage not available');
      return false;
    }
    
    try {
      const key = `${this.keyPrefix}${conversationId}`;
      
      // First, load the context to get document IDs for chunk cleanup
      const storedContext = this.storage.getItem(key);
      if (storedContext) {
        try {
          const parsedContext = JSON.parse(storedContext) as MCPContext;
          
          // Clean up document chunks
          if (parsedContext.documentContext) {
            for (const doc of parsedContext.documentContext) {
              if (doc.content && typeof doc.content === 'string' && doc.content.startsWith('__CHUNKED__:')) {
                const chunkIds = doc.content.substring(11).split(',');
                for (const chunkId of chunkIds) {
                  this.storage.removeItem(chunkId);
                }
                console.log(`Removed ${chunkIds.length} chunks for document ${doc.documentName}`);
              }
            }
          }
        } catch (e) {
          console.warn('Error parsing context during cleanup:', e);
        }
      }
      
      // Remove the main context and incomplete flag
      this.storage.removeItem(key);
      this.storage.removeItem(`${this.keyPrefix}${conversationId}-incomplete`);
      
      console.log(`Successfully removed context for ${conversationId} from storage`);
      return true;
    } catch (error) {
      console.error('Error removing context from storage:', error);
      return false;
    }
  }
  
  /**
   * Check storage usage statistics
   */
  getStorageStats(): { used: number, total: number, percentUsed: number } {
    let used = 0;
    let total = 0;
    
    if (this.storage) {
      // Calculate used space
      for (let i = 0; i < this.storage.length; i++) {
        const key = this.storage.key(i);
        if (key) {
          const value = this.storage.getItem(key) || '';
          used += key.length + value.length;
        }
      }
      
      // Estimate total space (varies by browser, ~5MB for most)
      total = 5 * 1024 * 1024;
    }
    
    return {
      used,
      total,
      percentUsed: total > 0 ? (used / total) * 100 : 0
    };
  }
}
