
import { useState, useEffect } from 'react';
import { MCPClient } from '@/integrations/mcp/client';

/**
 * Hook to track API loading state
 */
export function useApiStateTracking(client: MCPClient | null) {
  const [isApiLoading, setIsApiLoading] = useState(false);
  const [apiLoadError, setApiLoadError] = useState<Error | null>(null);
  
  // Setup API status monitoring
  useEffect(() => {
    if (client) {
      const interval = setInterval(() => {
        const apiLoaded = client.isApiLoaded?.();
        setIsApiLoading(!apiLoaded);
      }, 1000); // Check every second
      
      return () => clearInterval(interval);
    }
  }, [client]);
  
  return {
    isApiLoading,
    setIsApiLoading,
    apiLoadError,
    setApiLoadError
  };
}
