
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { SimplifiedAgentInterface } from '@/components/shared/agent';
import { useMondAI } from '@/hooks/use-mondai';
import { AgentMessage } from '@/lib/types';
import { useUserInteractionsOptimized } from '@/hooks/use-user-interactions-optimized';
import { useAuth } from '@/hooks/use-auth';
import { useVeniceAgent } from '@/hooks/use-venice-agent';

const SimplifiedMonDAIInterface: React.FC = React.memo(() => {
  const {
    conversationId,
    handleAIMessage,
  } = useMondAI();
  
  const { user } = useAuth();
  const { veniceActivated } = useVeniceAgent();
  const [isHistoryLoaded, setIsHistoryLoaded] = useState(false);
  
  // Use the optimized user interactions hook
  const { interactions, refreshInteractions } = useUserInteractionsOptimized('learn');
  
  // Memoize the initial welcome message to prevent recreation
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

  // Memoize the processed historical messages to prevent expensive recomputation
  const processedMessages = useMemo(() => {
    if (!interactions || interactions.length === 0) {
      return [welcomeMessage];
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
    
    // Sort messages by timestamp to ensure proper chronological order
    historicalMessages.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    
    return [welcomeMessage, ...historicalMessages];
  }, [interactions, welcomeMessage]);

  // Separate useEffect for Venice state logging (no dependencies on heavy objects)
  useEffect(() => {
    console.log('📡 SimplifiedMonDAIInterface: Venice state changed to:', veniceActivated);
  }, [veniceActivated]);
  
  // Optimized useEffect for loading conversation history
  useEffect(() => {
    const loadConversationHistory = async () => {
      if (!user || isHistoryLoaded) return;
      
      try {
        console.log('Loading MonDAI conversation history...');
        
        // Refresh interactions to get the latest data
        await refreshInteractions();
        
        const messageCount = processedMessages.length - 1; // Subtract welcome message
        console.log(`Loaded ${messageCount} historical messages for MonDAI`);
        
        setIsHistoryLoaded(true);
      } catch (error) {
        console.error('Error loading conversation history:', error);
        setIsHistoryLoaded(true);
      }
    };

    loadConversationHistory();
  }, [user, isHistoryLoaded, refreshInteractions]); // Removed processedMessages from dependencies

  return (
    <div className="h-screen flex flex-col">
      <SimplifiedAgentInterface
        title="Aigent Nakamoto"
        description={`Crypto-Agentic AI for Qrypto COYN + mẹtaKnyts ${veniceActivated ? '(Venice AI)' : '(OpenAI)'}`}
        agentType="mondai" 
        onMessageSubmit={handleAIMessage}
        conversationId={conversationId}
        initialMessages={processedMessages}
      />
    </div>
  );
});

SimplifiedMonDAIInterface.displayName = 'SimplifiedMonDAIInterface';

export default SimplifiedMonDAIInterface;
