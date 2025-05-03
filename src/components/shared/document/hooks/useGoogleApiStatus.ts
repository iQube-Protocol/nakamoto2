
import { useEffect, useState } from 'react';
import { useMCP } from '@/hooks/mcp/use-mcp';
import { toast } from 'sonner';

/**
 * Hook to check Google API status with improved error handling
 */
export const useGoogleApiStatus = () => {
  const { isApiLoading = false, checkApiStatus } = useMCP() || {};
  const [apiLoadingState, setApiLoadingState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [apiCheckAttempts, setApiCheckAttempts] = useState(0);
  
  useEffect(() => {
    // Check if Google API is available
    const checkGapiLoaded = () => {
      if (typeof window === 'undefined') {
        return false;
      }
      
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
    const maxApiCheckAttempts = 15; // Reduced from 40 to 15 to fail faster if there's an issue
    
    // Don't show loading toasts for too long, default to "error" state if taking too long
    const loadingToastTimeout = setTimeout(() => {
      if (apiLoadingState === 'loading' && apiCheckAttempts >= 5) {
        setApiLoadingState('error');
        toast.error('Google API is taking too long to load', {
          description: 'This might affect document browsing functionality',
          id: 'api-loading-timeout',
        });
      }
    }, 15000); // 15 seconds timeout
    
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

    // Clean up interval and timeout
    return () => {
      clearInterval(interval);
      clearTimeout(loadingToastTimeout);
    };
  }, [checkApiStatus]);
  
  useEffect(() => {
    // If isApiLoading is false, double check our own state
    if (isApiLoading === false && apiLoadingState === 'loading') {
      if ((window as any).gapi && (window as any).google?.accounts) {
        console.log('DocumentSelector: Google API detected as loaded after MCP reported loading complete');
        setApiLoadingState('loaded');
      }
    }
  }, [isApiLoading, apiLoadingState]);
  
  // Make API loading state more resilient - allow the app to continue if the API doesn't load
  useEffect(() => {
    if (apiLoadingState === 'loading' && apiCheckAttempts > 10) {
      console.warn('Google API taking too long to load, setting state to error so UI can continue');
      setApiLoadingState('error');
    }
  }, [apiCheckAttempts, apiLoadingState]);
  
  return {
    apiLoadingState,
    setApiLoadingState,
    apiCheckAttempts,
    setApiCheckAttempts,
    isApiLoading
  };
};
