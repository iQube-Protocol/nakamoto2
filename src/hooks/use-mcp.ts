import { useState, useEffect, useCallback } from 'react';
import { MCPClient, getMCPClient } from '@/integrations/mcp';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';

export function useMCP() {
  const [client, setClient] = useState<MCPClient | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [driveConnected, setDriveConnected] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isApiLoading, setIsApiLoading] = useState(false);
  const { user } = useAuth();
  
  // Initialize MCP client
  useEffect(() => {
    if (user) {
      // Check if we already have a connection to Google Drive
      const hasConnection = localStorage.getItem('gdrive-connected') === 'true';
      
      const mcpClient = getMCPClient({
        // Check for metisActive status from localStorage
        metisActive: localStorage.getItem('metisActive') === 'true',
        onApiLoadStart: () => setIsApiLoading(true),
        onApiLoadComplete: () => setIsApiLoading(false)
      });
      
      setClient(mcpClient);
      setIsInitialized(true);
      setDriveConnected(hasConnection);
      
      // Periodically verify the connection status
      const interval = setInterval(() => {
        const currentStatus = localStorage.getItem('gdrive-connected') === 'true';
        if (currentStatus !== driveConnected) {
          console.log('MCP: Drive connection status changed to', currentStatus);
          setDriveConnected(currentStatus);
        }
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [user, driveConnected]);
  
  // Connect to Google Drive with optimized flow
  const connectToDrive = useCallback(async (clientId?: string, apiKey?: string) => {
    if (!client) return false;
    
    setIsLoading(true);
    try {
      console.log('MCP: Starting Drive connection with', { clientId, apiKeyProvided: !!apiKey });
      
      // Validate that we have the required credentials
      if (!clientId || !apiKey) {
        toast.error('Missing Google API credentials');
        return false;
      }
      
      // Use cached token if available
      const cachedToken = localStorage.getItem('gdrive-auth-token');
      console.log('MCP: Cached token available:', !!cachedToken);
      
      // Connect to Google Drive with the provided credentials
      const success = await client.connectToDrive(clientId, apiKey, cachedToken);
      console.log('MCP: Connection result:', success);
      
      if (success) {
        localStorage.setItem('gdrive-connected', 'true');
        setDriveConnected(true);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Error connecting to Drive:', error);
      toast.error('Failed to connect to Google Drive', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [client]);
  
  // Reset connection state
  const resetConnection = useCallback(() => {
    if (!client) return;
    
    console.log('MCP: Resetting Drive connection');
    client.resetConnection();
    setDriveConnected(false);
    
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
    
    toast.success('Connection reset', {
      description: 'Google Drive connection has been reset'
    });
  }, [client]);
  
  // Optimized document listing with better error handling
  const listDocuments = useCallback(async (folderId?: string) => {
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
  }, [client, driveConnected]);
  
  // Force refresh by clearing cache and reloading
  const forceRefreshDocuments = useCallback(async (folderId?: string) => {
    // Clear cache for this folder
    const cacheKey = `gdrive-folder-${folderId || 'root'}`;
    sessionStorage.removeItem(cacheKey);
    
    // Reload documents
    return listDocuments(folderId);
  }, [listDocuments]);
  
  // Optimized document fetching with caching
  const fetchDocument = useCallback(async (documentId: string) => {
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
  }, [client, driveConnected]);
  
  // Initialize or get context for a conversation
  const initializeContext = useCallback(async (conversationId?: string) => {
    if (!client) return null;
    
    try {
      return await client.initializeContext(conversationId);
    } catch (error) {
      console.error('Error initializing MCP context:', error);
      toast.error('Failed to initialize conversation context');
      return null;
    }
  }, [client]);
  
  return {
    client,
    isInitialized,
    driveConnected,
    documents,
    isLoading,
    isApiLoading,
    connectToDrive,
    listDocuments,
    forceRefreshDocuments,
    fetchDocument,
    initializeContext,
    resetConnection
  };
}
