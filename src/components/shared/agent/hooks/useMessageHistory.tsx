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
  
  
  useEffect(() => {
    const loadConversationHistory = async () => {
      if (!user || isHistoryLoaded) return;
      
      try {
        console.log(`Loading ${agentType} conversation history...`);
        
        // Force clear any cached data that might contain HTML-wrapped content
        const cacheKey = `${agentType}_conversation_cache_${user.id}`;
        localStorage.removeItem(cacheKey);
        
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
              // Additional content sanitization for database content
              let cleanResponse = interaction.response
                .replace(/<div class="historic-response[^"]*">/g, '')
                .replace(/<\/div>/g, '')
                .replace(/<div[^>]*>/g, '')
                .trim();
              
              console.log(`Historical message sanitization:`, {
                original: interaction.response.substring(0, 50),
                cleaned: cleanResponse.substring(0, 50),
                hadHTML: interaction.response.includes('<div')
              });
              
              historicalMessages.push({
                id: `${interaction.id}-agent`,
                sender: 'agent',
                message: cleanResponse,
                timestamp: interaction.created_at,
                metadata: {
                  ...interaction.metadata,
                  historicResponse: true,
                  agentTheme: agentType
                }
              });
            }
          });
          
          historicalMessages.sort((a, b) => 
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );
          
          console.log(`Loaded ${historicalMessages.length} historical messages (${interactions.length} interactions) for ${agentType}`);
          
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