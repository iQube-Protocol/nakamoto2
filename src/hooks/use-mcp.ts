
import { useState, useEffect, useCallback } from 'react';
import { MCPClient, getMCPClient } from '@/integrations/mcp/client';
import { useAuth } from '@/hooks/use-auth';
import { useDriveContext } from './mcp/useDriveContext';
import { useDocumentContext } from './mcp/useDocumentContext';
import { useConversationContext } from './mcp/useConversationContext';
import { toast } from 'sonner';

/**
 * Main MCP hook that provides MCP client and related functionality
 */
export function useMCP() {
  const [client, setClient] = useState<MCPClient | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [initializationAttempted, setInitializationAttempted] = useState(false);
  const { user } = useAuth();
  
  // Initialize MCP client with improved error handling
  useEffect(() => {
    if (user) {
      const initClient = () => {
        try {
          const mcpClient = getMCPClient({
            // Check for metisActive status from localStorage
            metisActive: localStorage.getItem('metisActive') === 'true'
          });
          
          setClient(mcpClient);
          setIsInitialized(true);
          setInitializationAttempted(true);
          
          console.log('MCP client initialized with metisActive:', localStorage.getItem('metisActive') === 'true');
        } catch (error) {
          console.error('Error initializing MCP client:', error);
          setInitializationAttempted(true);
          toast.error('Failed to initialize document context system', {
            description: 'Document features may be unavailable'
          });
        }
      };
      
      initClient();
      
      // Listen for Metis activation changes
      const handleMetisActivated = () => {
        console.log('MCP detected Metis activation');
        initClient();
      };
      
      const handleMetisDeactivated = () => {
        console.log('MCP detected Metis deactivation');
        initClient();
      };
      
      window.addEventListener('metisActivated', handleMetisActivated);
      window.addEventListener('metisDeactivated', handleMetisDeactivated);
      
      return () => {
        window.removeEventListener('metisActivated', handleMetisActivated);
        window.removeEventListener('metisDeactivated', handleMetisDeactivated);
      };
    }
  }, [user]);
  
  // Function to force reinitialize client in case of errors
  const reinitializeClient = useCallback(() => {
    if (!user) return false;
    
    try {
      console.log('Force reinitializing MCP client...');
      
      // Explicitly reset any existing client
      const existingClient = getMCPClient();
      if (existingClient) {
        existingClient.reset();
      }
      
      // Create a completely new instance
      const mcpClient = getMCPClient({
        metisActive: localStorage.getItem('metisActive') === 'true',
        forceNewInstance: true
      });
      
      setClient(mcpClient);
      setIsInitialized(true);
      setInitializationAttempted(true);
      
      console.log('MCP client successfully reinitialized');
      return true;
    } catch (error) {
      console.error('Failed to reinitialize MCP client:', error);
      return false;
    }
  }, [user]);
  
  // Use the separated hooks
  const drive = useDriveContext(client);
  const document = useDocumentContext(client, drive.driveConnected);
  const conversation = useConversationContext(client);
  
  return {
    client,
    isInitialized,
    initializationAttempted,
    reinitializeClient,
    ...drive,
    ...document,
    ...conversation
  };
}
