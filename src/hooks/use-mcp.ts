
import { useState, useEffect, useCallback } from 'react';
import { MCPClient, getMCPClient } from '@/integrations/mcp/client';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';

export function useMCP() {
  const [client, setClient] = useState<MCPClient | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [driveConnected, setDriveConnected] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isApiLoading, setIsApiLoading] = useState(false);
  const [apiLoadError, setApiLoadError] = useState<Error | null>(null);
  const { user } = useAuth();
  
  // Initialize MCP client
  useEffect(() => {
    if (user) {
      // Check if we already have a connection to Google Drive
      const hasConnection = localStorage.getItem('gdrive-connected') === 'true';
      console.log('useMCP: Initial connection state from localStorage:', hasConnection);
      
      const mcpClient = getMCPClient({
        // Check for metisActive status from localStorage
        metisActive: localStorage.getItem('metisActive') === 'true',
        onApiLoadStart: () => {
          console.log('MCP API loading started');
          setIsApiLoading(true);
          setApiLoadError(null);
        },
        onApiLoadComplete: () => {
          console.log('MCP API loading completed');
          setIsApiLoading(false);
        }
      });
      
      setClient(mcpClient);
      setIsInitialized(true);
      setDriveConnected(hasConnection);
    }
  }, [user]);
  
  // Connect to Google Drive with optimized flow
  const connectToDrive = useCallback(async (clientId?: string, apiKey?: string) => {
    if (!client) return false;
    
    setIsLoading(true);
    try {
      // Validate that we have the required credentials
      if (!clientId || !apiKey) {
        toast.error('Missing Google API credentials');
        return false;
      }
      
      // Use cached token if available
      const cachedToken = localStorage.getItem('gdrive-auth-token');
      console.log('useMCP: Cached auth token exists:', !!cachedToken);
      
      console.log('useMCP: Connecting to Drive with clientId, apiKey, and cachedToken');
      // Connect to Google Drive with the provided credentials
      const success = await client.connectToDrive(clientId, apiKey, cachedToken);
      
      console.log('useMCP: Drive connection result:', success);
      if (success) {
        localStorage.setItem('gdrive-connected', 'true');
        setDriveConnected(true);
        return true;
      } else {
        // Make sure we clean up any stale state if connection failed
        localStorage.setItem('gdrive-connected', 'false');
        setDriveConnected(false);
        return false;
      }
    } catch (error) {
      console.error('Error connecting to Drive:', error);
      toast.error('Failed to connect to Google Drive', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      });
      
      // Make sure we clean up on error
      localStorage.setItem('gdrive-connected', 'false');
      setDriveConnected(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [client]);
  
  // Reset drive connection with improved handling
  const resetDriveConnection = useCallback(() => {
    if (client) {
      // Reset internal state in the client
      client.resetDriveConnection();
      
      // Clear connection status in localStorage
      localStorage.removeItem('gdrive-connected');
      localStorage.removeItem('gdrive-auth-token');
      
      // Update local state
      setDriveConnected(false);
      setDocuments([]);
      setApiLoadError(null);
      
      // Clear cache
      for (const key in sessionStorage) {
        if (key.startsWith('gdrive-folder-')) {
          sessionStorage.removeItem(key);
        }
      }
      
      toast.success('Google Drive connection reset', {
        description: 'You can now reconnect to Google Drive'
      });
    }
  }, [client]);
  
  // Optimized document listing with caching and better error handling
  const listDocuments = useCallback(async (folderId?: string): Promise<any[]> => {
    if (!client || !driveConnected) {
      toast.error('Not connected to Google Drive');
      return [];
    }
    
    const cacheKey = `gdrive-folder-${folderId || 'root'}`;
    const cachedData = sessionStorage.getItem(cacheKey);
    
    // Use cached data if available and recent (less than 60 seconds old)
    if (cachedData) {
      try {
        const { docs, timestamp } = JSON.parse(cachedData);
        const isRecent = Date.now() - timestamp < 60000; // 60 seconds
        
        if (isRecent) {
          console.log('Using cached folder data');
          setDocuments(docs);
          return docs;
        }
      } catch (e) {
        console.error('Error parsing cached folder data');
      }
    }
    
    setIsLoading(true);
    try {
      const docs = await client.listDocuments(folderId);
      setDocuments(docs);
      
      // Cache the results
      sessionStorage.setItem(cacheKey, JSON.stringify({
        docs,
        timestamp: Date.now()
      }));
      
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
      const id = await client.initializeContext(conversationId);
      console.log(`MCP: Context initialized with ID: ${id}`);
      return id;
    } catch (error) {
      console.error('Error initializing MCP context:', error);
      toast.error('Failed to initialize conversation context');
      return null;
    }
  }, [client]);
  
  // Check API status
  const checkApiStatus = useCallback(() => {
    if (!client) return false;
    
    // Check if Google API is loaded successfully
    const isLoaded = client.isApiLoaded?.();
    console.log('MCP API loaded status:', isLoaded);
    
    return isLoaded;
  }, [client]);

  // Monitor drive connection status
  useEffect(() => {
    if (client && driveConnected) {
      // Periodically verify the connection is still valid
      const intervalId = setInterval(() => {
        const isConnected = client.isConnectedToDrive();
        if (driveConnected !== isConnected) {
          console.log('useMCP: Connection state changed:', isConnected);
          setDriveConnected(isConnected);
        }
      }, 30000); // Check every 30 seconds
      
      return () => clearInterval(intervalId);
    }
  }, [client, driveConnected]);

  return {
    client,
    isInitialized,
    driveConnected,
    documents,
    isLoading,
    isApiLoading,
    apiLoadError,
    connectToDrive,
    resetDriveConnection,
    listDocuments,
    fetchDocument,
    initializeContext,
    checkApiStatus
  };
}
