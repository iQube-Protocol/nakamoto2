
import { useState, useEffect } from 'react';
import { MCPClient, getMCPClient } from '@/integrations/mcp/client';
import { useAuth } from '@/hooks/use-auth';
import { useDriveContext } from './mcp/useDriveContext';
import { useDocumentContext } from './mcp/useDocumentContext';
import { useConversationContext } from './mcp/useConversationContext';

/**
 * Main MCP hook that provides MCP client and related functionality
 */
export function useMCP() {
  const [client, setClient] = useState<MCPClient | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const { user } = useAuth();
  
  // Initialize MCP client
  useEffect(() => {
    if (user) {
      const initClient = () => {
        const mcpClient = getMCPClient({
        });
        
        setClient(mcpClient);
        setIsInitialized(true);
        
        console.log('MCP client initialized');
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
  
  // Use the separated hooks
  const drive = useDriveContext(client);
  const document = useDocumentContext(client, drive.driveConnected);
  const conversation = useConversationContext(client);
  
  return {
    client,
    isInitialized,
    ...drive,
    ...document,
    ...conversation
  };
}
