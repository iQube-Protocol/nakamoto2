import { useState, useEffect } from 'react';
import { AgentMessage } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { useUserInteractions } from '@/hooks/use-user-interactions';

/**
 * Hook to load and manage message history with enhanced conversational styling
 */
export const useMessageHistory = (
  agentType: 'learn' | 'earn' | 'connect' | 'mondai',
  initialMessages: AgentMessage[] = [],
  setMessages: React.Dispatch<React.SetStateAction<AgentMessage[]>>
) => {
  const [isHistoryLoaded, setIsHistoryLoaded] = useState(false);
  const { user } = useAuth();
  const { interactions, refreshInteractions } = useUserInteractions(agentType as any);
  
  const processHistoricContent = (content: string, agentType: string) => {
    return content
      .replace(/^(.*?)$/gm, (match) => {
        if (match.trim()) {
          return `<div class="historic-response ${agentType}-theme">${match}</div>`;
        }
        return match;
      });
  };
  
  useEffect(() => {
    const loadConversationHistory = async () => {
      if (!user || isHistoryLoaded) return;
      
      try {
        console.log(`Loading ${agentType} conversation history with enhanced styling...`);
        
        await refreshInteractions();
        
        if (interactions && interactions.length > 0) {
          const historicalMessages: AgentMessage[] = [];
          
          interactions.forEach((interaction) => {
            if (interaction.query && interaction.query.trim()) {
              historicalMessages.push({
                id: `${interaction.id}-user`,
                sender: 'user',
                message: interaction.query,
                timestamp: interaction.created_at,
              });
            }
            
            if (interaction.response && interaction.response.trim()) {
              const processedResponse = processHistoricContent(interaction.response, agentType);
              
              historicalMessages.push({
                id: `${interaction.id}-agent`,
                sender: 'agent',
                message: processedResponse,
                timestamp: interaction.created_at,
                metadata: {
                  ...interaction.metadata,
                  historicResponse: true,
                  agentTheme: agentType,
                  enhancedStyling: true
                }
              });
            }
          });
          
          historicalMessages.sort((a, b) => 
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );
          
          console.log(`Loaded ${historicalMessages.length} historical messages (${interactions.length} interactions) for ${agentType} with enhanced styling`);
          
          if (historicalMessages.length > 0) {
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
    isHistoryLoaded,
    refreshInteractions
  };
};