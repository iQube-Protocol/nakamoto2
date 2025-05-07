
import { useCallback } from 'react';
import { MCPClient } from '@/integrations/mcp/client';

/**
 * Hook for managing MCP conversation context
 */
export function useContextManagement(client: MCPClient | null) {
  // Initialize or retrieve context
  const initializeContext = useCallback(async (existingConversationId?: string): Promise<string> => {
    if (!client) throw new Error('Client not initialized');
    return client.initializeContext(existingConversationId);
  }, [client]);
  
  // Get documents in context
  const getDocumentsInContext = useCallback(async (conversationId?: string): Promise<any[]> => {
    if (!client) return [];
    return client.getDocumentsInContext(conversationId);
  }, [client]);
  
  // Add document to context
  const addDocumentToContext = useCallback(async (
    conversationId: string, 
    document: any, 
    documentType?: string, 
    content?: string
  ): Promise<boolean> => {
    if (!client) return false;
    return client.addDocumentToContext(conversationId, document, documentType, content);
  }, [client]);
  
  // Remove document from context
  const removeDocumentFromContext = useCallback(async (
    conversationId: string, 
    documentId: string
  ): Promise<boolean> => {
    if (!client) return false;
    return client.removeDocumentFromContext(conversationId, documentId);
  }, [client]);

  return {
    initializeContext,
    getDocumentsInContext,
    addDocumentToContext,
    removeDocumentFromContext
  };
}
