
import { useState, useEffect, useRef } from 'react';
import { PersonaContextService, ConversationContext } from '@/services/persona-context-service';

// Route-aware navigation state tracking
let isNavigating = false;
let currentRoute = '';

/**
 * Hook to get current persona context for conversations with navigation protection
 */
export function usePersonaContext() {
  const [context, setContext] = useState<ConversationContext>({ isAnonymous: true });
  const [isLoading, setIsLoading] = useState(true);
  const mountedRef = useRef(true);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const refreshContext = async () => {
    // Cancel any pending refresh
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    // Skip refresh during navigation to prevent compilation cascades
    if (isNavigating) {
      return;
    }

    setIsLoading(true);
    try {
      const newContext = await PersonaContextService.getConversationContext();
      if (mountedRef.current && !isNavigating) {
        setContext(newContext);
      }
    } catch (error) {
      console.error('Error loading persona context:', error);
      if (mountedRef.current && !isNavigating) {
        setContext({ isAnonymous: true });
      }
    } finally {
      if (mountedRef.current && !isNavigating) {
        setIsLoading(false);
      }
    }
  };

  const debouncedRefreshContext = () => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
    
    refreshTimeoutRef.current = setTimeout(() => {
      if (!isNavigating && mountedRef.current) {
        refreshContext();
      }
    }, 200); // 200ms debounce for context refresh
  };

  useEffect(() => {
    // Track current route for navigation detection
    const updateRoute = () => {
      const newRoute = window.location.pathname;
      if (newRoute !== currentRoute) {
        isNavigating = true;
        currentRoute = newRoute;
        
        // Clear navigation flag after route settles
        setTimeout(() => {
          isNavigating = false;
        }, 300);
      }
    };

    // Initial route setup
    updateRoute();
    refreshContext();

    // Track navigation state
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;
    
    window.history.pushState = function(...args) {
      isNavigating = true;
      const result = originalPushState.apply(this, args);
      setTimeout(() => { isNavigating = false; }, 300);
      return result;
    };
    
    window.history.replaceState = function(...args) {
      isNavigating = true;
      const result = originalReplaceState.apply(this, args);
      setTimeout(() => { isNavigating = false; }, 300);
      return result;
    };

    // Listen for persona activation/deactivation events with navigation protection
    const handlePersonaChange = () => {
      if (!isNavigating && mountedRef.current) {
        console.log('Persona activation state changed, refreshing context');
        debouncedRefreshContext();
      }
    };

    // Listen for navigation events
    const handleNavigationStart = () => {
      isNavigating = true;
    };

    const handleNavigationEnd = () => {
      setTimeout(() => {
        isNavigating = false;
        updateRoute();
      }, 100);
    };

    // Listen for iQube activation events
    window.addEventListener('qryptoPersonaActivated', handlePersonaChange);
    window.addEventListener('qryptoPersonaDeactivated', handlePersonaChange);
    window.addEventListener('knytPersonaActivated', handlePersonaChange);
    window.addEventListener('knytPersonaDeactivated', handlePersonaChange);
    
    // Navigation event listeners
    window.addEventListener('beforeunload', handleNavigationStart);
    window.addEventListener('popstate', handleNavigationEnd);

    return () => {
      window.removeEventListener('qryptoPersonaActivated', handlePersonaChange);
      window.removeEventListener('qryptoPersonaDeactivated', handlePersonaChange);
      window.removeEventListener('knytPersonaActivated', handlePersonaChange);
      window.removeEventListener('knytPersonaDeactivated', handlePersonaChange);
      window.removeEventListener('beforeunload', handleNavigationStart);
      window.removeEventListener('popstate', handleNavigationEnd);
      
      // Restore original history methods
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
      
      // Clear timeouts
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      
      mountedRef.current = false;
    };
  }, []);

  return {
    context,
    isLoading,
    refreshContext,
    generateContextualPrompt: (topic?: string) => 
      PersonaContextService.generateContextualPrompt(context, topic)
  };
}
