
import { useState, useEffect } from 'react';
import { AgentMessage } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { useUserInteractions } from '@/hooks/use-user-interactions';

/**
 * Hook to load and manage message history with enhanced conversational styling
 */
export const useMessageHistory = (
  agentType: 'learn' | 'earn' | 'connect', // We'll handle 'mondai' separately in useAgentMessages.tsx
  initialMessages: AgentMessage[] = [],
  setMessages: React.Dispatch<React.SetStateAction<AgentMessage[]>>
) => {
  const [isHistoryLoaded, setIsHistoryLoaded] = useState(false);
  const { user } = useAuth();
  const { interactions, refreshInteractions } = useUserInteractions(agentType);
  
  // Process historic content with conversational styling
  const processHistoricContent = (content: string, agentType: string) => {
    // Apply the same conversational guidelines to historic responses
    return content
      // Add theme class for styling
      .replace(/^(.*?)$/gm, (match) => {
        if (match.trim()) {
          return `<div class="historic-response ${agentType}-theme">${match}</div>`;
        }
        return match;
      });
  };
  
  // Load message history from database when component mounts
  useEffect(() => {
    const loadConversationHistory = async () => {
      if (!user || isHistoryLoaded) return;
      
      try {
        console.log(`Loading ${agentType} conversation history with enhanced styling...`);
        
        // Refresh interactions to get the latest data
        await refreshInteractions();
        
        if (interactions && interactions.length > 0) {
          // Transform database records into message format - create BOTH user and agent messages
          const historicalMessages: AgentMessage[] = [];
          
          interactions.forEach((interaction) => {
            // Create user message from the query
            if (interaction.query && interaction.query.trim()) {
              historicalMessages.push({
                id: `${interaction.id}-user`,
                sender: 'user',
                message: interaction.query,
                timestamp: interaction.created_at,
              });
            }
            
            // Create agent message from the response with enhanced styling
            if (interaction.response && interaction.response.trim()) {
              // Process the response content for better conversational display
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
          
          // Sort messages by timestamp to ensure proper chronological order
          historicalMessages.sort((a, b) => 
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );
          
          console.log(`Loaded ${historicalMessages.length} historical messages (${interactions.length} interactions) for ${agentType} with enhanced styling`);
          
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
    isHistoryLoaded,
    refreshInteractions
  };
};
