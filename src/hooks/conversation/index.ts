
import { useContextLoading } from './useContextLoading';
import { useDocumentContext } from './useDocumentContext';

interface UseConversationContextProps {
  conversationId: string | null;
  setConversationId: (id: string | null) => void;
  agentType: 'learn' | 'earn' | 'connect';
}

export const useConversationContext = ({
  conversationId,
  setConversationId,
  agentType
}: UseConversationContextProps) => {
  // Load conversation history and context
  const { historicalContext, isLoading } = useContextLoading({
    conversationId,
    setConversationId,
    agentType
  });

  // Track document context updates
  const { documentContextUpdated, setDocumentContextUpdated } = useDocumentContext();

  return {
    historicalContext,
    isLoading,
    documentContextUpdated,
    setDocumentContextUpdated
  };
};

export * from './useContextLoading';
export * from './useDocumentContext';
