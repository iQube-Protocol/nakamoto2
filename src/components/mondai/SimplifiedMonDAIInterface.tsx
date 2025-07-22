import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { SimplifiedAgentInterface } from '@/components/shared/agent';
import { useMondAI } from '@/hooks/use-mondai';
import { AgentMessage } from '@/lib/types';
import { useUserInteractionsOptimized } from '@/hooks/useUserInteractionsOptimized';
import { useAuth } from '@/hooks/use-auth';
import { useVeniceAgent } from '@/hooks/use-venice-agent';

const SimplifiedMonDAIInterface: React.FC = React.memo(() => {
  const {
    conversationId,
    handleAIMessage,
    resetConversation,
  } = useMondAI();
  
  const { user } = useAuth();
  const { veniceActivated } = useVeniceAgent();
  const [initialMessages, setInitialMessages] = useState<AgentMessage[]>([]);
  const [isHistoryLoaded, setIsHistoryLoaded] = useState(false);
  
  // Use optimized hook for better performance
  const { interactions, refreshInteractions } = useUserInteractionsOptimized('learn');
  
  // Debug persona activation state on component mount and route access
  useEffect(() => {
    console.log('🎯 MonDAI Interface: Component mounted, checking persona activation state...');
    const qryptoActivated = localStorage.getItem('qrypto-persona-activated') === 'true';
    const knytActivated = localStorage.getItem('knyt-persona-activated') === 'true';
    
    console.log('🎯 MonDAI Interface: Persona activation status:', {
      qryptoActivated,
      knytActivated,
      shouldBeAnonymous: !qryptoActivated && !knytActivated
    });

    // Clear any stale persona activation if both are false but user is still being addressed by name
    if (!qryptoActivated && !knytActivated) {
      console.log('🧹 MonDAI Interface: Ensuring clean anonymous state...');
      // Force clean state
      localStorage.setItem('qrypto-persona-activated', 'false');
      localStorage.setItem('knyt-persona-activated', 'false');
    }
  }, []);
  
  // Memoize the welcome message to prevent recreation on every render
  const welcomeMessage = useMemo(() => {
    const aiProvider = veniceActivated ? "Venice AI" : "OpenAI";
    const memoryStatus = conversationId ? "🧠 **Memory Active** - I can remember our conversation" : "💭 **New Session** - Starting fresh";
    
    console.log(`🎯 MonDAI Interface: Creating welcome message with anonymous guarantee`);
    
    return {
      id: "1",
      sender: "agent" as const,
      message: `Hello! I'm Aigent Nakamoto, your crypto-agentic AI assistant powered by **${aiProvider}** with access to both the **Qrypto COYN technical knowledge base** and the **mẹtaKnyts narrative universe**.

${memoryStatus}

I can help you with:
• **Technical concepts**: iQubes, VFTs, COYN Protocol, tokenomics, smart contracts
• **Narrative elements**: mẹtaKnyts characters (KnowOne, Satoshi Nakamoto, FANG Gang, BAT Pack)
• **Worldbuilding**: Terra/Digitterra dual reality framework  
• **Philosophy**: Clean Data principles, decentralized AI governance
• **Bitcoin & Crypto**: Runes, protocols, blockchain technology

${conversationId ? "I'll remember our conversation context and can reference our previous discussions naturally." : ""}

Try asking about "metaKnyts", "KnowOne", "Terra and Digitterra", "Bitcoin Runes", or any crypto/Web3 concept. I'll provide insights from both technical and narrative perspectives with proper citations.

What would you like to explore today?`,
      timestamp: new Date().toISOString(),
      metadata: {
        version: "1.0",
        modelUsed: veniceActivated ? "venice-gpt-4o-mini" : "gpt-4o-mini",
        knowledgeSource: "Qrypto COYN + mẹtaKnyts Knowledge Bases",
        qryptoItemsFound: 0,
        metaKnytsItemsFound: 0,
        citations: [],
        aiProvider: veniceActivated ? "Venice AI" : "OpenAI",
        conversationMemoryUsed: !!conversationId,
        isAnonymous: true // Force anonymous mode in welcome message
      }
    };
  }, [veniceActivated, conversationId]);

  // Memoize the historical message processing to prevent expensive recomputation
  const processedHistoricalMessages = useMemo(() => {
    if (!interactions || interactions.length === 0) {
      return [];
    }

    console.log(`🎯 MonDAI Interface: Processing ${interactions.length} historical interactions`);

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
    const sortedMessages = historicalMessages.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    
    console.log(`🎯 MonDAI Interface: Processed ${sortedMessages.length} historical messages`);
    return sortedMessages;
  }, [interactions]);

  // Add Venice state debugging (only in development)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('📡 SimplifiedMonDAIInterface: Venice state changed to:', veniceActivated);
      console.log('🧠 SimplifiedMonDAIInterface: Conversation ID:', conversationId);
    }
  }, [veniceActivated, conversationId]);
  
  useEffect(() => {
    const loadConversationHistory = () => {
      if (!user || isHistoryLoaded) {
        console.log('🎯 MonDAI Interface: Skipping history load - user:', !!user, 'isHistoryLoaded:', isHistoryLoaded);
        return;
      }
      
      try {
        console.log('🎯 MonDAI Interface: Loading conversation history...');
        console.log('🎯 MonDAI Interface: processedHistoricalMessages length:', processedHistoricalMessages.length);
        console.log('🎯 MonDAI Interface: processedHistoricalMessages:', processedHistoricalMessages);

        if (processedHistoricalMessages.length > 0) {
          console.log(`🎯 MonDAI Interface: Loaded ${processedHistoricalMessages.length} historical messages for MonDAI`);
          
          // Start with welcome message, then add history
          setInitialMessages([welcomeMessage, ...processedHistoricalMessages]);
        } else {
          // If no history, just set the welcome message
          console.log('🎯 MonDAI Interface: No historical messages found for MonDAI');
          setInitialMessages([welcomeMessage]);
        }
        
        setIsHistoryLoaded(true);
      } catch (error) {
        console.error('❌ MonDAI Interface: Error loading conversation history:', error);
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

  // Enhanced reset conversation with persona state cleanup
  const handleResetConversation = useCallback(() => {
    console.log('🔄 MonDAI Interface: User requested conversation reset');
    console.log('🧹 MonDAI Interface: Cleaning persona activation state to ensure anonymous mode');
    
    // Ensure clean anonymous state
    localStorage.setItem('qrypto-persona-activated', 'false');
    localStorage.setItem('knyt-persona-activated', 'false');
    
    // Dispatch deactivation events to ensure all components update
    window.dispatchEvent(new CustomEvent('qryptoPersonaDeactivated'));
    window.dispatchEvent(new CustomEvent('knytPersonaDeactivated'));
    
    resetConversation();
  }, [resetConversation]);

  return (
    <div className="h-screen flex flex-col">
      <SimplifiedAgentInterface
        title="Aigent Nakamoto"
        description={`Crypto-Agentic AI for Qrypto COYN + mẹtaKnyts ${veniceActivated ? '(Venice AI)' : '(OpenAI)'} ${conversationId ? '🧠' : '💭'}`}
        agentType="mondai" 
        onMessageSubmit={handleAIMessage}
        conversationId={conversationId}
        initialMessages={initialMessages}
        additionalActions={
          conversationId ? (
            <button
              onClick={handleResetConversation}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              title="Start a new conversation (clears memory and ensures anonymous mode)"
            >
              🔄 Reset Memory
            </button>
          ) : undefined
        }
      />
    </div>
  );
});

SimplifiedMonDAIInterface.displayName = 'SimplifiedMonDAIInterface';

export default SimplifiedMonDAIInterface;
