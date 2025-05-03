
import { useState, useCallback } from 'react';
import { MCPClient } from '@/integrations/mcp/client';
import { toast } from 'sonner';

/**
 * Hook for managing context in the MCP client
 */
export function useContextManagement(client: MCPClient | null) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Initialize context with existing conversation ID
  const initializeContext = useCallback(async (existingConversationId?: string): Promise<string | null> => {
    if (!client) return null;
    
    setIsLoading(true);
    try {
      const conversationId = await client.initializeContext(existingConversationId);
      console.log(`Context initialized with conversation ID: ${conversationId}`);
      return conversationId;
    } catch (error) {
      console.error('Error initializing context:', error);
      toast.error('Failed to initialize context', {
        description: 'Please try again later',
        duration: 3000,
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [client]);
  
  // Get documents in context
  const getDocumentsInContext = useCallback(async (conversationId?: string) => {
    if (!client) return [];
    
    try {
      const documents = await client.getDocumentsInContext(conversationId);
      return documents;
    } catch (error) {
      console.error('Error getting documents in context:', error);
      return [];
    }
  }, [client]);
  
  // Add document to context
  const addDocumentToContext = useCallback(async (conversationId: string, document: any, documentType?: string, content?: string) => {
    if (!client) {
      toast.error('MCP client not initialized');
      return false;
    }
    
    setIsLoading(true);
    try {
      const success = await client.addDocumentToContext(conversationId, document, documentType, content);
      toast.success('Document added to context', {
        description: `"${document.name || document.title}" is now available for AI assistance`,
        duration: 3000,
      });
      return success;
    } catch (error) {
      console.error('Error adding document to context:', error);
      toast.error('Failed to add document to context', {
        description: 'Please try again later',
        duration: 3000,
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [client]);
  
  // Remove document from context
  const removeDocumentFromContext = useCallback(async (conversationId: string, documentId: string) => {
    if (!client) {
      toast.error('MCP client not initialized');
      return false;
    }
    
    setIsLoading(true);
    try {
      const success = await client.removeDocumentFromContext(conversationId, documentId);
      toast.success('Document removed from context', {
        description: 'Document removed',
        duration: 3000,
      });
      return success;
    } catch (error) {
      console.error('Error removing document from context:', error);
      toast.error('Failed to remove document from context');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [client]);

  return {
    isLoading,
    initializeContext,
    getDocumentsInContext,
    addDocumentToContext,
    removeDocumentFromContext
  };
}
