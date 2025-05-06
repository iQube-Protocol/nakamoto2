
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { MCPClient } from '@/integrations/mcp/client';

/**
 * Hook for document operations with Google Drive
 */
export function useDocumentOperations(
  client: MCPClient | null,
  driveConnected: boolean,
  resetDriveConnection: () => void
) {
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState(0);
  
  // Optimized document listing with caching and better error handling
  const listDocuments = useCallback(async (folderId?: string): Promise<any[]> => {
    if (!client || !driveConnected) {
      // Only show error if client exists but not connected
      if (client) {
        toast.error('Not connected to Google Drive', { 
          duration: 3000,
          id: 'mcp-list-error',
        });
      }
      return [];
    }
    
    const cacheKey = `gdrive-folder-${folderId || 'root'}`;
    const cachedData = sessionStorage.getItem(cacheKey);
    const now = Date.now();
    
    // Use cached data if available and recent (less than 30 seconds old)
    if (cachedData) {
      try {
        const { docs, timestamp } = JSON.parse(cachedData);
        const isRecent = now - timestamp < 30000; // 30 seconds
        
        if (isRecent) {
          console.log('Using cached folder data');
          setDocuments(docs);
          return docs;
        }
      } catch (e) {
        console.error('Error parsing cached folder data');
      }
    }
    
    // Don't allow rapid successive refreshes (rate limit to once every 2 seconds)
    if (now - lastRefreshTime < 2000) {
      console.log('Skipping rapid refresh, using existing documents');
      return documents;
    }
    
    setLastRefreshTime(now);
    setIsLoading(true);
    
    // Clear any existing list document toasts
    toast.dismiss('mcp-list');
    toast.dismiss('mcp-list-error');
    
    try {
      const docs = await client.listDocuments(folderId);
      setDocuments(docs);
      
      // Cache the results
      sessionStorage.setItem(cacheKey, JSON.stringify({
        docs,
        timestamp: now
      }));
      
      return docs;
    } catch (error) {
      console.error('Error listing documents:', error);
      
      toast.error('Failed to list documents', {
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        duration: 4000,
        id: 'mcp-list-error',
      });
      
      // Check if this is due to authentication failure
      if (error instanceof Error && 
          (error.message.includes('auth') || error.message.includes('token'))) {
        // Reset drive connection
        resetDriveConnection();
      }
      
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [client, driveConnected, resetDriveConnection, documents, lastRefreshTime]);
  
  // Optimized document fetching with caching
  const fetchDocument = useCallback(async (documentId: string) => {
    if (!client || !driveConnected) {
      toast.error('Not connected to Google Drive', { 
        duration: 3000,
        id: 'mcp-fetch-error',
      });
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
    
    // Clear any document-specific toasts
    toast.dismiss(`doc-${documentId}`);
    toast.dismiss('mcp-fetch-error');
    
    try {
      const content = await client.fetchDocumentContent(documentId);
      
      // Cache the results if content exists
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
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        duration: 4000,
        id: 'mcp-fetch-error',
      });
      
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [client, driveConnected]);

  // Function to force refresh document list (with anti-bounce protection)
  const forceRefreshDocuments = useCallback(async (folderId?: string) => {
    if (!client || !driveConnected) return [];
    
    const now = Date.now();
    
    // Prevent refreshing more often than every 2 seconds
    if (now - lastRefreshTime < 2000) {
      console.log('Skipping rapid refresh attempt');
      return documents;
    }
    
    // Clear cache for this folder
    const cacheKey = `gdrive-folder-${folderId || 'root'}`;
    sessionStorage.removeItem(cacheKey);
    
    // Now refresh
    return listDocuments(folderId);
  }, [client, driveConnected, documents, lastRefreshTime, listDocuments]);

  return {
    documents,
    isLoading,
    listDocuments,
    fetchDocument,
    forceRefreshDocuments
  };
}
