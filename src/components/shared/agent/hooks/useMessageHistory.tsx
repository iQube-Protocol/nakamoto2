
import { useState, useEffect, useMemo, useCallback } from 'react';
import { AgentMessage } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { useUserInteractionsOptimized } from '@/hooks/use-user-interactions-optimized';

/**
 * Hook to load and manage message history with enhanced conversational styling
 */
export const useMessageHistory = (
  agentType: 'learn' | 'earn' | 'connect',
  initialMessages: AgentMessage[] = [],
  setMessages: React.Dispatch<React.SetStateAction<AgentMessage[]>>
) => {
  const [isHistoryLoaded, setIsHistoryLoaded] = useState(false);
  const { user } = useAuth();
  const { interactions, refreshInteractions } = useUserInteractionsOptimized(agentType);
  
  // Memoize the content processing function to avoid recreating it
  const processHistoricContent = useCallback((content: string, agentType: string) => {
    return content
      .replace(/^(.*?)$/gm, (match) => {
        if (match.trim()) {
          return `<div class="historic-response ${agentType}-theme">${match}</div>`;
        }
        return match;
      });
  }, []);
  
  // Memoize the historical messages processing
  const processedHistoricalMessages = useMemo(() => {
    if (!interactions || interactions.length === 0) {
      return [];
    }

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
    
    return historicalMessages;
  }, [interactions, agentType, processHistoricContent]);
  
  // Load message history from database when component mounts
  useEffect(() => {
    const loadConversationHistory = async () => {
      if (!user || isHistoryLoaded) return;
      
      try {
        console.log(`Loading ${agentType} conversation history with enhanced styling...`);
        
        // Refresh interactions to get the latest data
        await refreshInteractions();
        
        if (processedHistoricalMessages.length > 0) {
          console.log(`Loaded ${processedHistoricalMessages.length} historical messages for ${agentType} with enhanced styling`);
          
          // Combine with initial welcome message
          setMessages([...initialMessages, ...processedHistoricalMessages]);
        } else {
          console.log(`No historical messages found for ${agentType}`);
        }
        
        setIsHistoryLoaded(true);
      } catch (error) {
        console.error('Error loading conversation history:', error);
        setIsHistoryLoaded(true);
      }
    };

    loadConversationHistory();
  }, [agentType, user, isHistoryLoaded, refreshInteractions, initialMessages, processedHistoricalMessages, setMessages]);

  return { 
    isHistoryLoaded,
    refreshInteractions: useCallback(() => refreshInteractions(), [refreshInteractions])
  };
};
