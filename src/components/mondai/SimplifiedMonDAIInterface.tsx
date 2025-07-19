
import React, { useEffect, useState, useMemo } from 'react';
import { SimplifiedAgentInterface } from '@/components/shared/agent';
import { useMondAI } from '@/hooks/use-mondai';
import { AgentMessage } from '@/lib/types';
import { useUserInteractions } from '@/hooks/use-user-interactions';
import { useAuth } from '@/hooks/use-auth';
import { useVeniceAgent } from '@/hooks/use-venice-agent';

const SimplifiedMonDAIInterface: React.FC = () => {
  const {
    conversationId,
    handleAIMessage,
  } = useMondAI();
  
  const { user } = useAuth();
  const { veniceActivated } = useVeniceAgent();
  const [initialMessages, setInitialMessages] = useState<AgentMessage[]>([]);
  const [isHistoryLoaded, setIsHistoryLoaded] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  
  // Use the user interactions hook to load previous messages (using 'learn' type for mondai)
  const { interactions, refreshInteractions } = useUserInteractions('learn');
  
  // Memoize the initial message to prevent recreation on every render
  const welcomeMessage = useMemo((): AgentMessage => {
    const aiProvider = veniceActivated ? "Venice AI" : "OpenAI";
    return {
      id: "1",
      sender: "agent",
      message: `Hello! I'm Aigent Nakamoto, your crypto-agentic AI assistant powered by **${aiProvider}** with access to both the **Qrypto COYN technical knowledge base** and the **mẹtaKnyts narrative universe**.

I can help you with:
• **Technical concepts**: iQubes, VFTs, COYN Protocol, tokenomics, smart contracts
• **Narrative elements**: mẹtaKnyts characters (KnowOne, Satoshi Nakamoto, FANG Gang, BAT Pack)
• **Worldbuilding**: Terra/Digitterra dual reality framework
• **Philosophy**: Clean Data principles, decentralized AI governance

Try asking about "metaKnyts", "KnowOne", "Terra and Digitterra", or any crypto/Web3 concept. I'll provide insights from both technical and narrative perspectives with proper citations.

What would you like to explore today?`,
      timestamp: new Date().toISOString(),
      metadata: {
        version: "1.0",
        modelUsed: veniceActivated ? "venice-gpt-4o-mini" : "gpt-4o-mini",
        knowledgeSource: "Qrypto COYN + mẹtaKnyts Knowledge Bases",
        qryptoItemsFound: 0,
        metaKnytsItemsFound: 0,
        citations: [],
        aiProvider: veniceActivated ? "Venice AI" : "OpenAI"
      }
    };
  }, [veniceActivated]);
  
  // Add Venice state debugging
  useEffect(() => {
    console.log('📡 SimplifiedMonDAIInterface: Venice state changed to:', veniceActivated);
  }, [veniceActivated]);
  
  // Optimized conversation history loading with proper state management
  useEffect(() => {
    const loadConversationHistory = async () => {
      // Skip if already loaded, loading, or no user
      if (!user || isHistoryLoaded || isLoadingHistory) return;
      
      setIsLoadingHistory(true);
      
      try {
        console.log('Loading MonDAI conversation history...');
        
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
            
            // Create agent message from the response
            if (interaction.response && interaction.response.trim()) {
              historicalMessages.push({
                id: `${interaction.id}-agent`,
                sender: 'agent',
                message: interaction.response,
                timestamp: interaction.created_at,
                metadata: interaction.metadata || undefined
              });
            }
          });
          
          // Sort messages by timestamp to ensure proper chronological order
          historicalMessages.sort((a, b) => 
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );
          
          console.log(`Loaded ${historicalMessages.length} historical messages (${interactions.length} interactions) for MonDAI`);
          
          // Start with welcome message, then add history
          setInitialMessages([welcomeMessage, ...historicalMessages]);
        } else {
          // If no history, just set the welcome message
          console.log('No historical messages found for MonDAI');
          setInitialMessages([welcomeMessage]);
        }
        
      } catch (error) {
        console.error('Error loading conversation history:', error);
        // Fallback to just welcome message on error
        setInitialMessages([welcomeMessage]);
      } finally {
        setIsHistoryLoaded(true);
        setIsLoadingHistory(false);
      }
    };

    // Debounce the loading to prevent rapid calls
    const timeoutId = setTimeout(loadConversationHistory, 100);
    
    return () => clearTimeout(timeoutId);
  }, [user, interactions, refreshInteractions, isHistoryLoaded, isLoadingHistory, welcomeMessage]);

  // Show loading state while history is being loaded
  if (isLoadingHistory) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Loading conversation history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <SimplifiedAgentInterface
        title="Aigent Nakamoto"
        description={`Crypto-Agentic AI for Qrypto COYN + mẹtaKnyts ${veniceActivated ? '(Venice AI)' : '(OpenAI)'}`}
        agentType="mondai" 
        onMessageSubmit={handleAIMessage}
        conversationId={conversationId}
        initialMessages={initialMessages}
      />
    </div>
  );
};

export default SimplifiedMonDAIInterface;
