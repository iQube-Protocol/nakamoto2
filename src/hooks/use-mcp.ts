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
  const [lastRefreshTime, setLastRefreshTime] = useState(0);
  
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
  
  // Setup periodic connection verification
  useEffect(() => {
    if (client && driveConnected) {
      const interval = setInterval(() => {
        // Verify the connection is still valid by checking local storage and API state
        const storedConnectionState = localStorage.getItem('gdrive-connected') === 'true';
        const apiLoaded = client.isApiLoaded();
        const clientConnected = client.isConnectedToDrive();
        
        const isActuallyConnected = storedConnectionState && apiLoaded && clientConnected;
        
        if (driveConnected !== isActuallyConnected) {
          console.log(`useMCP: Connection state mismatch detected. Updating from ${driveConnected} to ${isActuallyConnected}`);
          setDriveConnected(isActuallyConnected);
          setConnectionStatus(isActuallyConnected ? 'connected' : 'disconnected');
          localStorage.setItem('gdrive-connected', isActuallyConnected ? 'true' : 'false');
        }
      }, 30000); // Check every 30 seconds
      
      return () => clearInterval(interval);
    }
  }, [client, driveConnected]);
  
  // Connect to Google Drive with optimized flow
  const connectToDrive = useCallback(async (clientId?: string, apiKey?: string) => {
    if (!client) return false;
    
    // Dismiss any lingering toasts to prevent duplicates
    toast.dismiss('mcp-connect');
    toast.dismiss('drive-connection');
    toast.dismiss('connecting-message');
    
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
      
      // Show a short-lived connecting toast
      toast.loading('Connecting to Google Drive...', {
        id: 'connecting-message',
        duration: 10000, // Auto-dismiss after 10s if the connection hangs
      });
      
      console.log('useMCP: Connecting to Drive with clientId, apiKey, and cachedToken');
      
      // Connect to Google Drive with the provided credentials
      const success = await client.connectToDrive(clientId, apiKey, cachedToken);
      
      // Dismiss the connecting toast
      toast.dismiss('connecting-message');
      
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
      
      // Dismiss the connecting toast
      toast.dismiss('connecting-message');
      
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
    // Dismiss any existing toasts to prevent stacking
    toast.dismiss('reset-connection');
    toast.dismiss('drive-connection');
    toast.dismiss('connecting-message');
    toast.dismiss('mcp-connect');
    
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

  // New method: Get documents in the current conversation context
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
  
  // New method: Add a document to the conversation context
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
  
  // New method: Remove a document from the conversation context
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
    checkApiStatus,
    forceRefreshDocuments,
    // Add the new methods to the return object
    getDocumentsInContext,
    addDocumentToContext,
    removeDocumentFromContext
  };
}
