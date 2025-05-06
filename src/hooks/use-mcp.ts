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
  const { user } = useAuth();
  
  // Initialize MCP client
  useEffect(() => {
    if (user) {
      try {
        // Try to clean up localStorage first
        const localStorageSize = JSON.stringify(localStorage).length;
        if (localStorageSize > 4000000) { // If more than 4MB
          console.warn('localStorage is nearly full, attempting cleanup...');
          // Find and clear old MCP contexts
          Object.keys(localStorage).forEach(key => {
            if (key.startsWith('mcp_context_') && key !== 'mcp_context_current') {
              try {
                localStorage.removeItem(key);
              } catch (e) {
                console.error(`Failed to remove ${key}:`, e);
              }
            }
          });
        }
        
        const mcpClient = getMCPClient({
          // Check for metisActive status from localStorage
          metisActive: localStorage.getItem('metisActive') === 'true'
        });
        
        // Add custom methods to handle storage issues
        if (mcpClient) {
          // Add method to clear old contexts
          mcpClient.clearOldContexts = () => {
            try {
              Object.keys(localStorage).forEach(key => {
                if (key.startsWith('mcp_context_') && key !== 'mcp_context_current') {
                  localStorage.removeItem(key);
                }
              });
              return true;
            } catch (e) {
              console.error('Failed to clear old contexts:', e);
              return false;
            }
          };
          
          // Replace or enhance persistContext method to handle quota errors
          const originalPersistContext = mcpClient.persistContext;
          mcpClient.persistContext = () => {
            try {
              return originalPersistContext.call(mcpClient);
            } catch (error) {
              // If storage quota error, try to clean up and retry
              if (
                error.name === 'QuotaExceededError' ||
                error.message?.includes('quota') ||
                error.message?.includes('storage')
              ) {
                console.error('Storage quota exceeded, cleaning up and retrying...');
                
                // Try clearing old contexts first
                mcpClient.clearOldContexts();
                
                // Try truncating document content in the current context
                try {
                  const context = mcpClient.getModelContext();
                  if (context?.documentContext?.length > 0) {
                    // Truncate all document content
                    const MAX_CONTENT_LENGTH = 5000; // More aggressive truncation
                    context.documentContext = context.documentContext.map(doc => ({
                      ...doc,
                      content: doc.content?.length > MAX_CONTENT_LENGTH 
                        ? doc.content.substring(0, MAX_CONTENT_LENGTH) + ' [content truncated]'
                        : doc.content
                    }));
                    
                    // If still too many documents, keep only the most recent ones
                    if (context.documentContext.length > 5) {
                      context.documentContext = context.documentContext.slice(-5);
                    }
                    
                    // Try to save again
                    return originalPersistContext.call(mcpClient);
                  }
                } catch (truncateError) {
                  console.error('Failed to truncate documents:', truncateError);
                  throw error; // Re-throw the original error
                }
              }
              
              // Re-throw the error if we couldn't handle it
              throw error;
            }
          };
          
          // Add a refreshContext method that safely refreshes the context
          mcpClient.refreshContext = () => {
            try {
              const currentContextId = mcpClient.getCurrentContextId();
              if (currentContextId) {
                return mcpClient.persistContext();
              }
              return false;
            } catch (error) {
              console.error('Error refreshing context:', error);
              return false;
            }
          };
          
          // Add method to get current context ID
          mcpClient.getCurrentContextId = () => {
            try {
              const context = mcpClient.getModelContext();
              return context?.conversationId || null;
            } catch (error) {
              return null;
            }
          };
        }
        
        setClient(mcpClient);
        setIsInitialized(true);
        
        // Check if we already have a connection to Google Drive
        const hasConnection = localStorage.getItem('gdrive-connected') === 'true';
        setDriveConnected(hasConnection);
      } catch (error) {
        console.error('Failed to initialize MCP client:', error);
        toast.error('Failed to initialize document management');
      }
    }
  }, [user]);
  
  // Connect to Google Drive
  const connectToDrive = useCallback(async (clientId?: string, apiKey?: string) => {
    if (!client) return false;
    
    setIsLoading(true);
    try {
      // Validate that we have the required credentials
      if (!clientId || !apiKey) {
        toast.error('Missing Google API credentials', {
          description: 'Both Client ID and API Key are required'
        });
        return false;
      }
      
      // Connect to Google Drive with the provided credentials
      const success = await client.connectToDrive(clientId, apiKey);
      
      if (success) {
        localStorage.setItem('gdrive-connected', 'true');
        setDriveConnected(true);
        
        // Automatically fetch documents after successful connection
        await listDocuments();
        
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
  
  // Reset Google Drive connection without page reload
  const resetDriveConnection = useCallback(async () => {
    try {
      // Clear connection cache first
      localStorage.removeItem('gdrive-connected');
      
      // Clear any Google API session tokens
      if (window.google?.accounts?.oauth2) {
        window.google.accounts.oauth2.revoke(undefined, () => {
          console.log('Google OAuth tokens revoked');
        });
      }
      
      // Clear GAPI auth
      if (window.gapi?.auth) {
        window.gapi.auth.setToken(null);
      }
      
      // Reset client's connection state
      if (client) {
        client.resetDriveConnection();
      }
      
      // Update local state
      setDriveConnected(false);
      
      return true;
    } catch (error) {
      console.error('Error during connection reset:', error);
      throw error;
    }
  }, [client]);
  
  // List available documents
  const listDocuments = useCallback(async (folderId?: string) => {
    if (!client || !driveConnected) {
      toast.error('Not connected to Google Drive');
      return [];
    }
    
    setIsLoading(true);
    try {
      const docs = await client.listDocuments(folderId);
      setDocuments(docs);
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
  
  // Fetch a document's content
  const fetchDocument = useCallback(async (documentId: string) => {
    if (!client || !driveConnected) {
      toast.error('Not connected to Google Drive');
      return null;
    }
    
    setIsLoading(true);
    try {
      return await client.fetchDocumentContent(documentId);
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
      
      // Handle storage quota errors
      if (
        error.name === 'QuotaExceededError' ||
        error.message?.includes('quota') ||
        error.message?.includes('storage')
      ) {
        toast.error('Browser storage full', {
          description: 'Trying to free up space by clearing old data...'
        });
        
        try {
          // Try to clear old contexts
          if (client.clearOldContexts()) {
            // Try again
            return await client.initializeContext(conversationId);
          }
        } catch (retryError) {
          console.error('Failed retry after clearing contexts:', retryError);
        }
      }
      
      toast.error('Failed to initialize conversation context');
      return null;
    }
  }, [client]);
  
  // Fix the refreshContext function to ensure it always returns a boolean
  const refreshContext = useCallback((): boolean => {
    try {
      if (!client) return false;
      
      const currentContextId = client.getCurrentContextId();
      if (currentContextId) {
        // Call the client's refreshContext method and ensure we return a boolean
        return Boolean(client.refreshContext());
      }
      return false;
    } catch (error) {
      console.error('Error refreshing context:', error);
      return false;
    }
  }, [client]);
  
  // Get current context ID
  const getCurrentContextId = useCallback((): string | null => {
    try {
      if (client) {
        return client.getCurrentContextId();
      }
      return null;
    } catch (error) {
      console.error('Error getting context ID:', error);
      return null;
    }
  }, [client]);
  
  return {
    client,
    isInitialized,
    driveConnected,
    documents,
    isLoading,
    connectToDrive,
    resetDriveConnection,
    listDocuments,
    fetchDocument,
    initializeContext,
    refreshContext,
    getCurrentContextId
  };
}
