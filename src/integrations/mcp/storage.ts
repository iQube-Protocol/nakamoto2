/**
 * Storage management for MCP client
 */
import { MCPContext } from './types';

/**
 * Persist context to localStorage with size limits to prevent quota issues
 */
export const persistContext = (context: MCPContext, conversationId: string): boolean => {
  try {
    // Limit message history to prevent localStorage from getting too large
    if (context.messages && context.messages.length > 20) {
      context.messages = context.messages.slice(-20);
    }
    
    // Limit document context size
    if (context.documentContext && context.documentContext.length > 5) {
      // Keep only the 5 most recently added documents
      context.documentContext = context.documentContext.slice(-5);
    }
    
    // For each document, limit the content size
    if (context.documentContext) {
      context.documentContext.forEach(doc => {
        if (doc.content && doc.content.length > 10000) {
          doc.content = doc.content.substring(0, 10000) + "... (content truncated)";
        }
      });
    }
    
    // Save to local storage
    localStorage.setItem(`mcp-context-${conversationId}`, JSON.stringify(context));
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
  // Try to clean up old contexts to free up space
  cleanupOldContexts();
  
  // Try to save a reduced context if possible
  try {
    // Create a minimal context with just the essential information
    const minimalContext = {
      conversationId: context.conversationId,
      messages: context.messages ? context.messages.slice(-5) : [],
      documentContext: [],
      metadata: context.metadata
    };
    
    localStorage.setItem(`mcp-context-${conversationId}`, JSON.stringify(minimalContext));
    console.log('MCP: Saved minimal context due to storage limitations');
    return true;
  } catch (innerError) {
    console.error('MCP: Failed to save even minimal context:', innerError);
    return false;
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
    
    // Remove all but the 5 most recent contexts
    if (contextKeys.length > 5) {
      const keysToRemove = contextKeys.slice(0, contextKeys.length - 5);
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        console.log(`MCP: Removed old context ${key} to free up space`);
      });
    }
  } catch (error) {
    console.error('MCP: Error cleaning up old contexts:', error);
  }
};
