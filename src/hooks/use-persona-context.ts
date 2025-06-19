
import { useState, useEffect } from 'react';
import { PersonaContextService, ConversationContext } from '@/services/persona-context-service';

/**
 * Hook to get current persona context for conversations
 */
export function usePersonaContext() {
  const [context, setContext] = useState<ConversationContext>({ isAnonymous: true });
  const [isLoading, setIsLoading] = useState(true);

  const refreshContext = async () => {
    setIsLoading(true);
    try {
      const newContext = await PersonaContextService.getConversationContext();
      setContext(newContext);
    } catch (error) {
      console.error('Error loading persona context:', error);
      setContext({ isAnonymous: true });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshContext();

    // Listen for persona activation/deactivation events
    const handlePersonaChange = () => {
      console.log('Persona activation state changed, refreshing context');
      refreshContext();
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
