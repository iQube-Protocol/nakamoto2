
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
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [loadedContextIds, setLoadedContextIds] = useState<string[]>([]);
  
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
      setConnectionStatus(hasConnection ? 'connected' : 'disconnected');
    }
  }, [user]);
  
  // Connect to Google Drive with optimized flow
  const connectToDrive = useCallback(async (clientId?: string, apiKey?: string) => {
    if (!client) return false;
    
    setIsLoading(true);
    setConnectionStatus('connecting');
    
    try {
      // Validate that we have the required credentials
      if (!clientId || !apiKey) {
        toast.error('Missing Google API credentials', { 
          duration: 3000,
          id: 'mcp-credentials-error',
        });
        setConnectionStatus('error');
        return false;
      }
      
      // Use cached token if available
      const cachedToken = localStorage.getItem('gdrive-auth-token');
      console.log('useMCP: Cached auth token exists:', !!cachedToken);
      
      console.log('useMCP: Connecting to Drive with clientId, apiKey, and cachedToken');
      
      // Clear any existing connection-related toasts
      toast.dismiss('mcp-connect');
      
      // Connect to Google Drive with the provided credentials
      const success = await client.connectToDrive(clientId, apiKey, cachedToken);
      
      console.log('useMCP: Drive connection result:', success);
      if (success) {
        localStorage.setItem('gdrive-connected', 'true');
        setDriveConnected(true);
        setConnectionStatus('connected');
        return true;
      } else {
        // Make sure we clean up any stale state if connection failed
        localStorage.setItem('gdrive-connected', 'false');
        setDriveConnected(false);
        setConnectionStatus('error');
        return false;
      }
    } catch (error) {
      console.error('Error connecting to Drive:', error);
      
      toast.dismiss('mcp-connect');
      toast.error('Failed to connect to Google Drive', {
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        duration: 4000,
        id: 'mcp-connect-error',
      });
      
      // Make sure we clean up on error
      localStorage.setItem('gdrive-connected', 'false');
      setDriveConnected(false);
      setConnectionStatus('error');
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
      setConnectionStatus('disconnected');
      
      // Clear cache
      for (const key in sessionStorage) {
        if (key.startsWith('gdrive-folder-')) {
          sessionStorage.removeItem(key);
        }
      }
    }
  }, [client]);
  
  // Get the current connection status from the client
  const getConnectionStatus = useCallback((): 'disconnected' | 'connecting' | 'connected' | 'error' => {
    if (!client) return 'disconnected';
    
    // Check if the DriveOperations class has a status getter method
    if (typeof client.getConnectionStatus === 'function') {
      return client.getConnectionStatus();
    }
    
    // Default to the driveConnected state if method is not available
    return driveConnected ? 'connected' : 'disconnected';
  }, [client, driveConnected]);
  
  // Optimized document listing with caching and better error handling
  const listDocuments = useCallback(async (folderId?: string): Promise<any[]> => {
    if (!client || !driveConnected) {
      // If error toast is already visible, don't show another one
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
    
    // Use cached data if available and recent (less than 30 seconds old)
    if (cachedData) {
      try {
        const { docs, timestamp } = JSON.parse(cachedData);
        const isRecent = Date.now() - timestamp < 30000; // 30 seconds
        
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
      
      // Clear persistent toasts
      toast.dismiss('mcp-list');
      
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
  }, [client, driveConnected, resetDriveConnection]);
  
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
    try {
      const content = await client.fetchDocumentContent(documentId);
      
      // Clear any persistent toasts
      toast.dismiss(`doc-${documentId}`);
      
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
      
      toast.dismiss(`doc-${documentId}`);
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
          setConnectionStatus(isConnected ? 'connected' : 'disconnected');
        }
      }, 30000); // Check every 30 seconds
      
      return () => clearInterval(intervalId);
    }
  }, [client, driveConnected]);
  
  // Update state based on localStorage changes (in case of multi-tab operation)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'gdrive-connected') {
        const newConnected = e.newValue === 'true';
        if (driveConnected !== newConnected) {
          console.log('useMCP: Connection state changed via localStorage:', newConnected);
          setDriveConnected(newConnected);
          setConnectionStatus(newConnected ? 'connected' : 'disconnected');
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [driveConnected]);

  return {
    client,
    isInitialized,
    driveConnected,
    documents,
    isLoading,
    isApiLoading,
    apiLoadError,
    connectionStatus,
    getConnectionStatus,
    connectToDrive,
    resetDriveConnection,
    listDocuments,
    fetchDocument,
    initializeContext,
    checkApiStatus
  };
}
