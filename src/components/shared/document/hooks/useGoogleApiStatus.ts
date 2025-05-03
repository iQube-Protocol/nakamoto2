
import { useEffect, useState } from 'react';
import { useMCP } from '@/hooks/mcp/use-mcp';

/**
 * Hook to check Google API status
 */
export const useGoogleApiStatus = () => {
  const { isApiLoading, checkApiStatus } = useMCP();
  const [apiLoadingState, setApiLoadingState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [apiCheckAttempts, setApiCheckAttempts] = useState(0);
  
  useEffect(() => {
    // Check if Google API is available
    const checkGapiLoaded = () => {
      if ((window as any).gapi && (window as any).google?.accounts) {
        console.log('DocumentSelector: Google API detected as loaded');
        setApiLoadingState('loaded');
        return true;
      }
      
      // If we have access to the MCP API status check, use that too
      if (checkApiStatus && checkApiStatus()) {
        console.log('DocumentSelector: Google API detected as loaded via MCP');
        setApiLoadingState('loaded');
        return true;
      }
      
      return false;
    };

    // Initial check
    if (checkGapiLoaded()) {
      return; // Already loaded
    }

    // Set up an interval to check if API is loaded with a maximum number of attempts
    const maxApiCheckAttempts = 40; // Increase from 30 to 40
    const interval = setInterval(() => {
      setApiCheckAttempts(prev => {
        const newCount = prev + 1;
        console.log(`API load check attempt: ${newCount}/${maxApiCheckAttempts}`);
        
        if (newCount >= maxApiCheckAttempts) {
          clearInterval(interval);
          setApiLoadingState('error');
          return newCount;
        }
        
        if (checkGapiLoaded()) {
          clearInterval(interval);
        }
        return newCount;
      });
    }, 1000);

    // Clean up interval
    return () => clearInterval(interval);
  }, [checkApiStatus]);
  
  useEffect(() => {
    // If isApiLoading is false, double check our own state
    if (!isApiLoading && apiLoadingState === 'loading') {
      if ((window as any).gapi && (window as any).google?.accounts) {
        console.log('DocumentSelector: Google API detected as loaded after MCP reported loading complete');
        setApiLoadingState('loaded');
      }
    }
  }, [isApiLoading, apiLoadingState]);
  
  return {
    apiLoadingState,
    setApiLoadingState,
    apiCheckAttempts,
    setApiCheckAttempts,
    isApiLoading
  };
};
