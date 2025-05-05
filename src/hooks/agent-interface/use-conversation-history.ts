
import { useState, useEffect } from 'react';
import { AgentMessage } from '@/lib/types';

interface UseConversationHistoryProps {
  initialMessages: AgentMessage[];
  interactions: any[] | null;
  refreshInteractions: () => Promise<void>;
  agentType: string;
  user: any | null;
  setMessages: (messages: AgentMessage[]) => void;
}

export const useConversationHistory = ({
  initialMessages,
  interactions,
  refreshInteractions,
  agentType,
  user,
  setMessages
}: UseConversationHistoryProps) => {
  const [isHistoryLoaded, setIsHistoryLoaded] = useState(false);

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
  }, [agentType, user, interactions, initialMessages, isHistoryLoaded, refreshInteractions, setMessages]);

  return {
    isHistoryLoaded
  };
};
