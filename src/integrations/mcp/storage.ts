/**
 * Storage management for MCP client
 */
import { MCPContext } from './types';

// Maximum size constants to prevent localStorage issues
const MAX_MESSAGES = 10; // Reduced from 20
const MAX_DOCUMENTS = 3; // Reduced from 5
const MAX_DOCUMENT_CONTENT_SIZE = 5000; // Reduced from 10000
const MAX_STORAGE_SIZE = 2000000; // ~2MB cap for localStorage

/**
 * Persist context to localStorage with size limits to prevent quota issues
 */
export const persistContext = (context: MCPContext, conversationId: string): boolean => {
  try {
    // Create a copy of the context to modify
    const trimmedContext = { ...context };
    
    // Limit message history
    if (trimmedContext.messages && trimmedContext.messages.length > MAX_MESSAGES) {
      trimmedContext.messages = trimmedContext.messages.slice(-MAX_MESSAGES);
    }
    
    // Limit document context size
    if (trimmedContext.documentContext && trimmedContext.documentContext.length > MAX_DOCUMENTS) {
      // Keep only the most recently added documents
      trimmedContext.documentContext = trimmedContext.documentContext.slice(-MAX_DOCUMENTS);
    }
    
    // For each document, limit the content size
    if (trimmedContext.documentContext) {
      trimmedContext.documentContext.forEach(doc => {
        if (doc.content) {
          if (doc.content.length > MAX_DOCUMENT_CONTENT_SIZE) {
            doc.content = doc.content.substring(0, MAX_DOCUMENT_CONTENT_SIZE) + "... (content truncated)";
          }
        }
      });
    }
    
    // Estimate total storage size and trim further if needed
    const jsonString = JSON.stringify(trimmedContext);
    if (jsonString.length > MAX_STORAGE_SIZE) {
      console.warn('MCP: Context too large, removing document content from storage');
      
      // Create document content index to minimize localStorage usage
      const contentIndex: Record<string, boolean> = {};
      
      if (trimmedContext.documentContext) {
        trimmedContext.documentContext.forEach(doc => {
          if (doc.documentId && doc.content) {
            contentIndex[doc.documentId] = true;
            // Replace content with a placeholder
            doc.content = "Content available but not stored in localStorage to save space";
          }
        });
      }
    }
    
    // Save to local storage
    localStorage.setItem(`mcp-context-${conversationId}`, JSON.stringify(trimmedContext));
    console.log(`MCP: Context persisted for conversation ${conversationId}`);
    return true;
  } catch (error) {
    console.error('MCP: Error persisting context:', error);
    
    if (error instanceof Error && 
        (error.name === 'QuotaExceededError' || error.message.includes('quota') || error.message.includes('exceeded'))) {
      return handleStorageQuotaExceeded(context, conversationId);
    }
    
    return false;
  }
};

/**
 * Load context from localStorage
 */
export const loadContext = (conversationId: string): MCPContext | null => {
  try {
    const storedContext = localStorage.getItem(`mcp-context-${conversationId}`);
    if (storedContext) {
      return JSON.parse(storedContext);
    }
    return null;
  } catch (error) {
    console.error(`MCP: Error loading context for ${conversationId}:`, error);
    return null;
  }
};

/**
 * Handle storage quota exceeded errors
 */
const handleStorageQuotaExceeded = (context: MCPContext, conversationId: string): boolean => {
  // Clean up old contexts first
  cleanupOldContexts();
  
  // Try to save a reduced context if possible
  try {
    // Create a minimal context with just the essential information
    const minimalContext = {
      conversationId: context.conversationId,
      messages: context.messages ? context.messages.slice(-3) : [], // Only keep last 3 messages
      documentContext: [], // Remove document content entirely
      metadata: context.metadata
    };
    
    localStorage.setItem(`mcp-context-${conversationId}`, JSON.stringify(minimalContext));
    console.log('MCP: Saved minimal context due to storage limitations');
    return true;
  } catch (innerError) {
    console.error('MCP: Failed to save even minimal context:', innerError);
    
    // Last resort: try to clear all storage except for the current session
    try {
      removeAllContextsExcept(conversationId);
      
      // Try once more with minimal context
      const emergencyContext = {
        conversationId: context.conversationId,
        messages: [{
          role: 'system',
          content: 'Previous context was removed due to storage limitations',
          timestamp: new Date().toISOString()
        }],
        documentContext: [],
        metadata: { emergency: true }
      };
      
      localStorage.setItem(`mcp-context-${conversationId}`, JSON.stringify(emergencyContext));
      return true;
    } catch (finalError) {
      console.error('MCP: All attempts to save context failed:', finalError);
      return false;
    }
  }
};

/**
 * Clean up old contexts to free up storage space
 */
export const cleanupOldContexts = (): void => {
  try {
    // Get all keys in localStorage
    const keys = Object.keys(localStorage);
    
    // Filter for mcp-context keys
    const contextKeys = keys.filter(key => key.startsWith('mcp-context-'));
    
    // Get timestamp for each context from its content
    const keyTimestamps: [string, number][] = contextKeys.map(key => {
      try {
        const content = localStorage.getItem(key);
        if (!content) return [key, 0];
        
        const parsed = JSON.parse(content);
        // Use the timestamp of the latest message or current time if no messages
        const latestMessageTime = parsed.messages && parsed.messages.length > 0 
          ? new Date(parsed.messages[parsed.messages.length - 1].timestamp).getTime()
          : 0;
        
        return [key, latestMessageTime || 0];
      } catch {
        return [key, 0]; // If we can't parse it, it's a candidate for removal
      }
    });
    
    // Sort by timestamp (oldest first)
    keyTimestamps.sort((a, b) => a[1] - b[1]);
    
    // Remove all but the 3 most recent contexts
    if (keyTimestamps.length > 3) {
      const keysToRemove = keyTimestamps.slice(0, keyTimestamps.length - 3).map(item => item[0]);
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        console.log(`MCP: Removed old context ${key} to free up space`);
      });
    }
  } catch (error) {
    console.error('MCP: Error cleaning up old contexts:', error);
  }
};

/**
 * Remove all contexts except the current one
 */
const removeAllContextsExcept = (conversationId: string): void => {
  try {
    // Get all keys in localStorage
    const keys = Object.keys(localStorage);
    
    // Filter for mcp-context keys
    const contextKeys = keys.filter(key => key.startsWith('mcp-context-') && !key.includes(conversationId));
    
    // Remove all other contexts
    contextKeys.forEach(key => {
      localStorage.removeItem(key);
      console.log(`MCP: Emergency removed context ${key} to free up space`);
    });
  } catch (error) {
    console.error('MCP: Error in emergency cleanup:', error);
  }
};
