
import { useState } from 'react';
import { useKnowledgeBase } from '@/hooks/mcp/useKnowledgeBase';
import { getKBAIDirectService, KBAIServerSettings } from '@/integrations/kbai/KBAIDirectService';
import { sonnerToast as toast } from '@/hooks/use-toast';

export function useKBAIConnection() {
  // Initialize from the service
  const [serverConfig, setServerConfig] = useState<KBAIServerSettings>(() => {
    const kbaiService = getKBAIDirectService();
    return kbaiService.getServerConfig();
  });
  
  // Track manual retry attempts
  const [isRetrying, setIsRetrying] = useState(false);
  
  const { 
    retryConnection,
    connectionStatus,
    fetchKnowledgeItems
  } = useKnowledgeBase();

  // Handle server config updates
  const handleConfigUpdate = (config: KBAIServerSettings) => {
    setServerConfig(config);
    // The service will already be updated from within the config component
  };

  // Handle manual connection retry
  const handleManualRetry = async () => {
    setIsRetrying(true);
    try {
      console.log('MonDAI: Manual connection retry initiated');
      toast.info('Attempting to reconnect to knowledge base...', {
        duration: 3000,
      });
      
      const success = await retryConnection();
      
      if (success) {
        toast.success('Successfully connected to knowledge base!');
      } else {
        toast.error('Unable to connect to knowledge base', {
          description: 'Using offline mode with fallback data',
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Error during manual retry:', error);
      toast.error('Connection retry failed', {
        description: 'Please try again later',
      });
    } finally {
      setIsRetrying(false);
    }
  };

  const getStatusDescription = () => {
    if (isRetrying) return "Connecting to knowledge base...";
    switch (connectionStatus) {
      case 'connected': return "Community agent with KBAI integration";
      case 'connecting': return "Establishing knowledge base connection...";
      case 'error': return "Community agent with offline knowledge base";
      default: return "Community agent with offline knowledge base";
    }
  };

  return {
    serverConfig,
    isRetrying,
    connectionStatus,
    fetchKnowledgeItems,
    getStatusDescription,
    handleConfigUpdate,
    handleManualRetry
  };
}
