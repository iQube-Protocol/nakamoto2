
import { useState, useCallback } from 'react';
import { MCPClient } from '@/integrations/mcp';
import { toast } from 'sonner';

/**
 * Hook for managing MCP document operations
 */
export function useMCPDocuments() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Optimized document listing with better error handling
  const listDocuments = useCallback(async (
    client: MCPClient | null, 
    driveConnected: boolean, 
    folderId?: string
  ) => {
    if (!client) {
      toast.error('MCP Client not initialized');
      return [];
    }
    
    if (!driveConnected) {
      toast.error('Not connected to Google Drive');
      return [];
    }
    
    const cacheKey = `gdrive-folder-${folderId || 'root'}`;
    const cachedData = sessionStorage.getItem(cacheKey);
    
    // Use cached data if available and recent (less than 30 seconds old)
    if (cachedData) {
      try {
        const { docs, timestamp } = JSON.parse(cachedData);
        const isRecent = Date.now() - timestamp < 30000; // 30 seconds
        
        if (isRecent) {
          console.log('Using cached folder data');
          setDocuments(docs);
          return docs;
        } else {
          console.log('Cached folder data expired');
        }
      } catch (e) {
        console.error('Error parsing cached folder data:', e);
      }
    }
    
    setIsLoading(true);
    try {
      console.log(`MCP: Listing documents in folder ${folderId || 'root'}`);
      const docs = await client.listDocuments(folderId);
      setDocuments(docs);
      
      // Only cache if successful
      if (docs && docs.length > 0) {
        // Cache the results
        sessionStorage.setItem(cacheKey, JSON.stringify({
          docs,
          timestamp: Date.now()
        }));
      }
      
      return docs;
    } catch (error) {
      console.error('Error listing documents:', error);
      toast.error('Failed to list documents', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Force refresh by clearing cache and reloading
  const forceRefreshDocuments = useCallback(async (
    client: MCPClient | null,
    driveConnected: boolean,
    folderId?: string
  ) => {
    // Clear cache for this folder
    const cacheKey = `gdrive-folder-${folderId || 'root'}`;
    sessionStorage.removeItem(cacheKey);
    
    // Reload documents
    return listDocuments(client, driveConnected, folderId);
  }, [listDocuments]);
  
  // Optimized document fetching with caching
  const fetchDocument = useCallback(async (
    client: MCPClient | null,
    driveConnected: boolean,
    documentId: string
  ) => {
    if (!client || !driveConnected) {
      toast.error('Not connected to Google Drive');
      return null;
    }
    
    const cacheKey = `gdrive-doc-${documentId}`;
    const cachedData = localStorage.getItem(cacheKey);
    
    // Use cached data if available (document content doesn't change often)
    if (cachedData) {
      try {
        const { content, timestamp } = JSON.parse(cachedData);
        const isRecent = Date.now() - timestamp < 3600000; // 1 hour
        
        if (isRecent) {
          console.log('Using cached document content');
          return content;
        }
      } catch (e) {
        console.error('Error parsing cached document data');
      }
    }
    
    setIsLoading(true);
    try {
      const content = await client.fetchDocumentContent(documentId);
      
      // Cache the results
      if (content) {
        localStorage.setItem(cacheKey, JSON.stringify({
          content,
          timestamp: Date.now()
        }));
      }
      
      return content;
    } catch (error) {
      console.error(`Error fetching document ${documentId}:`, error);
      toast.error('Failed to fetch document', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Clear all document caches
  const clearDocumentCaches = useCallback(() => {
    // Clear cached documents
    setDocuments([]);
    
    // Clear all cached folder data
    const keys = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith('gdrive-folder-')) {
        keys.push(key);
      }
    }
    keys.forEach(key => sessionStorage.removeItem(key));
  }, []);
  
  return {
    documents,
    isLoading,
    listDocuments,
    forceRefreshDocuments,
    fetchDocument,
    clearDocumentCaches
  };
}
