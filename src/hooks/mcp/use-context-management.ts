
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { MCPClient } from '@/integrations/mcp/client';

/**
 * Hook for managing MCP conversation contexts and document associations
 */
export function useContextManagement(client: MCPClient | null) {
  const [loadedContextIds, setLoadedContextIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Initialize or get context for a conversation with tracking to avoid duplicate initialization
  const initializeContext = useCallback(async (conversationId?: string) => {
    if (!client) return null;
    
    try {
      // Check if we've already loaded this context to prevent duplicate loads
      if (conversationId && loadedContextIds.includes(conversationId)) {
        console.log(`MCP: Context already loaded for conversation: ${conversationId}`);
        return conversationId;
      }
      
      const id = await client.initializeContext(conversationId);
      console.log(`MCP: Context initialized with ID: ${id}`);
      
      // Track that we've loaded this context
      if (id && !loadedContextIds.includes(id)) {
        setLoadedContextIds(prev => [...prev, id]);
      }
      
      return id;
    } catch (error) {
      console.error('Error initializing MCP context:', error);
      toast.error('Failed to initialize conversation context', {
        duration: 3000,
        id: 'mcp-init-error',
      });
      return null;
    }
  }, [client, loadedContextIds]);
  
  // Get documents in the current conversation context
  const getDocumentsInContext = useCallback(async (conversationId: string): Promise<any[]> => {
    if (!client) {
      console.log('No MCP client available to get documents in context');
      return [];
    }
    
    setIsLoading(true);
    try {
      console.log(`Getting documents in context for conversation: ${conversationId}`);
      
      // First try from client's document context cache
      const docs = client.getDocumentContext?.(conversationId) || [];
      
      if (docs.length > 0) {
        console.log(`Found ${docs.length} documents in context from client`);
        return docs;
      }
      
      // If no docs in client cache, try localStorage backup
      const localDocsKey = `docs-${conversationId}`;
      const storedDocs = localStorage.getItem(localDocsKey);
      
      if (storedDocs) {
        try {
          const parsedDocs = JSON.parse(storedDocs);
          if (Array.isArray(parsedDocs) && parsedDocs.length > 0) {
            console.log(`Found ${parsedDocs.length} documents in localStorage backup`);
            return parsedDocs;
          }
        } catch (e) {
          console.error('Error parsing stored documents:', e);
        }
      }
      
      console.log('No documents found in context');
      return [];
    } catch (error) {
      console.error('Error getting documents in context:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [client]);
  
  // Add a document to the conversation context
  const addDocumentToContext = useCallback(async (conversationId: string, document: any): Promise<boolean> => {
    if (!client) {
      console.error('Cannot add document to context: MCP client not initialized');
      return false;
    }
    
    setIsLoading(true);
    try {
      console.log(`Adding document ${document.id} to context for conversation ${conversationId}`);
      
      // First, fetch the document content if not already available
      if (!document.content) {
        const content = await client.fetchDocumentContent(document.id);
        if (!content) {
          console.error('Failed to fetch document content');
          return false;
        }
        document.content = content;
      }
      
      // Extract document type from mimeType
      const documentType = document.mimeType?.split('/')[1] || 'plain';
      
      // Add to client's context
      client.addDocumentToContext(
        document.id,
        document.name,
        documentType,
        document.content
      );
      
      // Also update localStorage backup
      const localDocsKey = `docs-${conversationId}`;
      let currentDocs: any[] = [];
      
      try {
        const storedDocs = localStorage.getItem(localDocsKey);
        if (storedDocs) {
          currentDocs = JSON.parse(storedDocs);
          if (!Array.isArray(currentDocs)) currentDocs = [];
        }
      } catch (e) {
        console.error('Error parsing stored documents:', e);
      }
      
      // Check if document is already in the list
      const existingIndex = currentDocs.findIndex(doc => doc.id === document.id);
      if (existingIndex === -1) {
        // Add document to list
        currentDocs.push(document);
        localStorage.setItem(localDocsKey, JSON.stringify(currentDocs));
        console.log(`Document ${document.id} added to localStorage backup`);
      }
      
      return true;
    } catch (error) {
      console.error('Error adding document to context:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [client]);
  
  // Remove a document from the conversation context
  const removeDocumentFromContext = useCallback(async (conversationId: string, documentId: string): Promise<boolean> => {
    if (!client) {
      console.error('Cannot remove document from context: MCP client not initialized');
      return false;
    }
    
    setIsLoading(true);
    try {
      console.log(`Removing document ${documentId} from context for conversation ${conversationId}`);
      
      // Remove from client's context
      const removed = client.removeDocumentFromContext(documentId);
      
      // Also update localStorage backup
      const localDocsKey = `docs-${conversationId}`;
      let currentDocs: any[] = [];
      let localRemoved = false;
      
      try {
        const storedDocs = localStorage.getItem(localDocsKey);
        if (storedDocs) {
          currentDocs = JSON.parse(storedDocs);
          if (Array.isArray(currentDocs)) {
            const initialLength = currentDocs.length;
            currentDocs = currentDocs.filter(doc => doc.id !== documentId);
            localRemoved = initialLength !== currentDocs.length;
            
            localStorage.setItem(localDocsKey, JSON.stringify(currentDocs));
            console.log(`Document ${documentId} removed from localStorage backup`);
          }
        }
      } catch (e) {
        console.error('Error updating stored documents:', e);
      }
      
      return removed || localRemoved;
    } catch (error) {
      console.error('Error removing document from context:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [client]);
  
  return {
    loadedContextIds,
    isLoading,
    initializeContext,
    getDocumentsInContext,
    addDocumentToContext,
    removeDocumentFromContext
  };
}
