
import { useState, useEffect, useRef } from 'react';
import { PersonaContextService, ConversationContext } from '@/services/persona-context-service';
import NavigationGuard from '@/utils/NavigationGuard';

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
    if (NavigationGuard.isNavigationInProgress()) {
      return;
    }

    setIsLoading(true);
    try {
      const newContext = await PersonaContextService.getConversationContext();
      if (mountedRef.current && !NavigationGuard.isNavigationInProgress()) {
        setContext(newContext);
      }
    } catch (error) {
      console.error('Error loading persona context:', error);
      if (mountedRef.current && !NavigationGuard.isNavigationInProgress()) {
        setContext({ isAnonymous: true });
      }
    } finally {
      if (mountedRef.current && !NavigationGuard.isNavigationInProgress()) {
        setIsLoading(false);
      }
    }
  };

  const debouncedRefreshContext = () => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
    
    refreshTimeoutRef.current = setTimeout(() => {
      if (!NavigationGuard.isNavigationInProgress() && mountedRef.current) {
        refreshContext();
      }
    }, 200); // 200ms debounce for context refresh
  };

  useEffect(() => {
    NavigationGuard.init();

    // Initial context load
    refreshContext();

    // Listen for persona activation/deactivation events with navigation protection
    const handlePersonaChange = () => {
      if (!NavigationGuard.isNavigationInProgress() && mountedRef.current) {
        console.log('Persona activation state changed, refreshing context');
        debouncedRefreshContext();
      }
    };

    // Listen for iQube activation events
    window.addEventListener('qryptoPersonaActivated', handlePersonaChange);
    window.addEventListener('qryptoPersonaDeactivated', handlePersonaChange);
    window.addEventListener('knytPersonaActivated', handlePersonaChange);
    window.addEventListener('knytPersonaDeactivated', handlePersonaChange);

    return () => {
      window.removeEventListener('qryptoPersonaActivated', handlePersonaChange);
      window.removeEventListener('qryptoPersonaDeactivated', handlePersonaChange);
      window.removeEventListener('knytPersonaActivated', handlePersonaChange);
      window.removeEventListener('knytPersonaDeactivated', handlePersonaChange);
      
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
