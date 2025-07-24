
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { SimplifiedAgentInterface } from '@/components/shared/agent';
import { useMondAI } from '@/hooks/use-mondai';
import { AgentMessage } from '@/lib/types';
import { useUserInteractionsOptimized } from '@/hooks/useUserInteractionsOptimized';
import { useAuth } from '@/hooks/use-auth';
import { useVeniceAgent } from '@/hooks/use-venice-agent';

const SimplifiedMonDAIInterfaceOptimized: React.FC = React.memo(() => {
  const {
    conversationId,
    handleAIMessage,
  } = useMondAI();
  
  const { user } = useAuth();
  const { veniceActivated } = useVeniceAgent();
  const [initialMessages, setInitialMessages] = useState<AgentMessage[]>([]);
  const [isHistoryLoaded, setIsHistoryLoaded] = useState(false);
  
  // Use optimized hook for better performance
  const { interactions, refreshInteractions } = useUserInteractionsOptimized('learn');
  
  // Memoize the welcome message to prevent recreation on every render
  const welcomeMessage = useMemo(() => {
    const aiProvider = veniceActivated ? "Venice AI" : "OpenAI";
    return {
      id: "1",
      sender: "agent" as const,
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

  // Memoize the historical message processing to prevent expensive recomputation
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
    
    // Sort messages by timestamp - memoized to prevent repeated sorting
    return historicalMessages.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }, [interactions]);

  // Add Venice state debugging (only in development)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('📡 SimplifiedMonDAIInterface: Venice state changed to:', veniceActivated);
    }
  }, [veniceActivated]);
  
  // Optimized conversation history loading with proper dependencies
  useEffect(() => {
    const loadConversationHistory = () => {
      if (!user || isHistoryLoaded) return;
      
      try {
        if (process.env.NODE_ENV === 'development') {
          console.log('Loading MonDAI conversation history...');
        }

        if (processedHistoricalMessages.length > 0) {
          if (process.env.NODE_ENV === 'development') {
            console.log(`Loaded ${processedHistoricalMessages.length} historical messages for MonDAI`);
          }
          
          // Start with welcome message, then add history
          setInitialMessages([welcomeMessage, ...processedHistoricalMessages]);
        } else {
          // If no history, just set the welcome message
          if (process.env.NODE_ENV === 'development') {
            console.log('No historical messages found for MonDAI');
          }
          setInitialMessages([welcomeMessage]);
        }
        
        setIsHistoryLoaded(true);
      } catch (error) {
        console.error('Error loading conversation history:', error);
        setInitialMessages([welcomeMessage]);
        setIsHistoryLoaded(true);
      }
    };

    loadConversationHistory();
  }, [user, processedHistoricalMessages, welcomeMessage, isHistoryLoaded]);

  // Memoized refresh function to prevent unnecessary recreations
  const memoizedRefreshInteractions = useCallback(() => {
    return refreshInteractions();
  }, [refreshInteractions]);

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
});

SimplifiedMonDAIInterfaceOptimized.displayName = 'SimplifiedMonDAIInterfaceOptimized';

export default SimplifiedMonDAIInterfaceOptimized;
