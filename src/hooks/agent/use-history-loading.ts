
import { useEffect } from 'react';
import { AgentMessage } from '@/lib/types';
import { useUserInteractions } from '@/hooks/use-user-interactions';
import { useAuth } from '@/hooks/use-auth';

interface UseHistoryLoadingProps {
  agentType: 'learn' | 'earn' | 'connect';
  initialMessages: AgentMessage[];
  isHistoryLoaded: boolean; 
  setIsHistoryLoaded: (loaded: boolean) => void;
  setMessages: (messages: AgentMessage[]) => void;
}

export const useHistoryLoading = ({
  agentType,
  initialMessages,
  isHistoryLoaded,
  setIsHistoryLoaded,
  setMessages
}: UseHistoryLoadingProps) => {
  const { user } = useAuth();
  const { interactions, refreshInteractions } = useUserInteractions(agentType);

  // Load message history from database when component mounts
  useEffect(() => {
    const loadConversationHistory = async () => {
      if (!user || isHistoryLoaded) return;
      
      try {
        console.log(`Loading ${agentType} conversation history...`);
        
        // Refresh interactions to get the latest data
        await refreshInteractions();
        
        if (interactions && interactions.length > 0) {
          // Transform database records into message format
          const historicalMessages = interactions.map((interaction): AgentMessage => {
            return {
              id: interaction.id,
              sender: 'agent',
              message: interaction.response,
              timestamp: interaction.created_at,
              metadata: interaction.metadata || undefined
            };
          });
          
          console.log(`Loaded ${historicalMessages.length} historical messages for ${agentType}`);
          
          // Only set messages if we have historical data and haven't loaded before
          if (historicalMessages.length > 0) {
            // Combine with initial welcome message
            setMessages([...initialMessages, ...historicalMessages]);
          }
        } else {
          console.log(`No historical messages found for ${agentType}`);
        }
        
        setIsHistoryLoaded(true);
      } catch (error) {
        console.error('Error loading conversation history:', error);
      }
    };

    loadConversationHistory();
  }, [
    agentType, 
    user, 
    interactions, 
    initialMessages, 
    isHistoryLoaded, 
    refreshInteractions, 
    setIsHistoryLoaded, 
    setMessages
  ]);
};
