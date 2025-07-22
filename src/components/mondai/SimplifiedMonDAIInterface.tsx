
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
      console.log('🎯 MonDAI Interface: No interactions to process');
      return [];
    }

    console.log(`🎯 MonDAI Interface: Processing ${interactions.length} historical interactions`);

    const historicalMessages: AgentMessage[] = [];
    
    try {
      interactions.forEach((interaction, index) => {
        console.log(`🎯 MonDAI Interface: Processing interaction ${index + 1}:`, {
          id: interaction.id,
          hasQuery: !!interaction.query,
          hasResponse: !!interaction.response,
          createdAt: interaction.created_at
        });
        
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
      
      console.log(`🎯 MonDAI Interface: Successfully processed ${sortedMessages.length} historical messages`);
      return sortedMessages;
    } catch (error) {
      console.error('🎯 MonDAI Interface: Error processing historical messages:', error);
      return [];
    }
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

        if (processedHistoricalMessages.length > 0) {
          console.log(`🎯 MonDAI Interface: Loaded ${processedHistoricalMessages.length} historical messages for MonDAI`);
          
          // Start with welcome message, then add history
          const messagesWithHistory = [welcomeMessage, ...processedHistoricalMessages];
          console.log(`🎯 MonDAI Interface: Setting ${messagesWithHistory.length} total messages (1 welcome + ${processedHistoricalMessages.length} history)`);
          setInitialMessages(messagesWithHistory);
        } else {
          // If no history, just set the welcome message
          console.log('🎯 MonDAI Interface: No historical messages found for MonDAI, using welcome message only');
          setInitialMessages([welcomeMessage]);
        }
        
        setIsHistoryLoaded(true);
        console.log('🎯 MonDAI Interface: History loading completed successfully');
      } catch (error) {
        console.error('❌ MonDAI Interface: Error loading conversation history:', error);
        // Fallback to welcome message only on error
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

  // Error boundary for the entire interface
  const [hasError, setHasError] = useState(false);

  // Error recovery effect
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('🔧 MonDAI Interface: Global error caught:', event.error);
      // Don't crash the entire interface for diagram errors
      if (event.error?.message?.includes('mermaid') || event.error?.message?.includes('diagram')) {
        console.log('🔧 MonDAI Interface: Mermaid error detected, not crashing interface');
        event.preventDefault();
        return;
      }
      setHasError(true);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return (
      <div className="h-screen flex flex-col items-center justify-center p-8">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-semibold mb-4">Something went wrong</h2>
          <p className="text-muted-foreground mb-4">
            The MonDAI interface encountered an error. Please refresh the page to continue.
          </p>
          <button
            onClick={() => {
              setHasError(false);
              window.location.reload();
            }}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

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
