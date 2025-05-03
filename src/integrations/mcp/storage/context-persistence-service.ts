import { MCPContextData } from '../types';
import { LocalStorageService } from './local-storage-service';

/**
 * Service for persisting context data to storage
 */
export class ContextPersistenceService {
  /**
   * Save context to persistence store with improved error handling
   */
  static persistContext(context: MCPContextData): boolean {
    if (!context.conversationId) {
      console.error('Cannot persist context: missing conversation ID');
      return false;
    }
    
    try {
      // Try to save the full context
      const key = `mcp-context-${context.conversationId}`;
      const contextString = JSON.stringify(context);
      
      // Attempt to save the whole context
      const success = LocalStorageService.setItem(key, contextString);
      if (success) {
        return true;
      }
      
      // If full context save fails, try minimal context
      return this.persistMinimalContext(context);
    } catch (error) {
      console.warn('MCP: Error persisting full context:', error);
      return this.persistMinimalContext(context);
    }
  }
  
  /**
   * Load context from persistence store
   */
  static loadContext(conversationId: string): MCPContextData | null {
    const key = `mcp-context-${conversationId}`;
    const storedContext = LocalStorageService.getItem(key);
    
    if (!storedContext) {
      // Try to get minimal context if full context not found
      const minimalKey = `mcp-context-minimal-${conversationId}`;
      const minimalContext = LocalStorageService.getItem(minimalKey);
      
      if (!minimalContext) {
        return null;
      }
      
      try {
        return JSON.parse(minimalContext);
      } catch (e) {
        console.error('MCP: Error parsing minimal context:', e);
        return null;
      }
    }
    
    try {
      return JSON.parse(storedContext);
    } catch (e) {
      console.error('MCP: Error parsing context:', e);
      return null;
    }
  }
  
  /**
   * Fallback method to save a minimal version of the context
   * when localStorage quota is exceeded
   */
  private static persistMinimalContext(context: MCPContextData): boolean {
    try {
      // Create a minimal version of the context without document content
      const minimalContext: MCPContextData = {
        conversationId: context.conversationId,
        messages: context.messages.slice(-10), // Keep only the last 10 messages
        metadata: context.metadata
      };
      
      // If there are documents, keep their references but not content
      if (context.documentContext) {
        minimalContext.documentContext = context.documentContext.map(doc => ({
          documentId: doc.documentId,
          documentName: doc.documentName,
          documentType: doc.documentType,
          content: '', // Don't store content
          lastModified: doc.lastModified
        }));
      }
      
      const key = `mcp-context-minimal-${context.conversationId}`;
      const minimalContextString = JSON.stringify(minimalContext);
      
      const success = LocalStorageService.setItem(key, minimalContextString);
      if (success) {
        console.log('MCP: Stored minimal context due to storage limitations');
      }
      return success;
    } catch (error) {
      // If even minimal context fails, just log the error
      console.error('MCP: Failed to store even minimal context:', error);
      return false;
    }
  }
  
  /**
   * Clean up old localStorage items to free up space
   */
  static cleanupOldItems(currentConversationId: string | null): void {
    try {
      // Find keys that start with 'mcp-context-'
      const keys = LocalStorageService.findKeys('mcp-context-');
      
      // Filter out current conversation
      const keysToRemove = keys.filter(key => 
        currentConversationId && 
        key !== `mcp-context-${currentConversationId}` && 
        key !== `mcp-context-minimal-${currentConversationId}`
      );
      
      // Sort by creation time (oldest first), limit to removing 5 oldest items
      keysToRemove.sort().slice(0, 5).forEach(key => {
        LocalStorageService.removeItem(key);
        console.log(`MCP: Removed old context: ${key}`);
      });
      
      return;
    } catch (error) {
      console.error('MCP: Error cleaning up localStorage:', error);
    }
  }
}
