
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
  
  // PRODUCTION FIX: Force clean state and prevent cache corruption
  const [buildVersion] = useState(() => `mondai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  
  useEffect(() => {
    // AGGRESSIVE CACHE CLEARING for production
    console.log('🧹 PRODUCTION FIX: Clearing all mondai-related caches...');
    
    // Clear all storage that might contain corrupted content
    const keysToRemove = [];
    
    // Check localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('mondai') || key.includes('mermaid') || key.includes('conversation') || key.includes('agent'))) {
        keysToRemove.push(key);
      }
    }
    
    // Check sessionStorage
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && (key.includes('mondai') || key.includes('mermaid') || key.includes('conversation') || key.includes('agent'))) {
        keysToRemove.push(key);
      }
    }
    
    // Remove all identified keys
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
    
    console.log(`🗑️ PRODUCTION FIX: Cleared ${keysToRemove.length} cached items:`, keysToRemove);
    
    // Set build version for debugging
    sessionStorage.setItem('mondai_build_version', buildVersion);
    
  }, [buildVersion]);
  
  // Use optimized hook for better performance - FIXED: was fetching 'learn' instead of 'mondai'
  const { interactions, refreshInteractions } = useUserInteractionsOptimized('mondai');
  
  // Memoize the welcome message to prevent recreation on every render
  const welcomeMessage = useMemo(() => {
    const aiProvider = veniceActivated ? "Venice AI (Uncensored)" : "OpenAI";
    const memoryStatus = conversationId ? "🧠 **Memory Active** - I can remember our conversation" : "💭 **New Session** - Starting fresh";
    
    console.log(`🎯 MonDAI Interface: Creating welcome message with memory status: ${memoryStatus}`);
    
    return {
      id: "1",
      sender: "agent" as const,
      message: `Hello! I'm Aigent Nakamoto, your crypto-agentic AI assistant powered by **${aiProvider}** with access to the **iQube Protocol, COYN, Qripto, and metaKnyts knowledge bases**.

${memoryStatus}

I can help you with:
• **Technical concepts**: iQubes, VFTs, COYN Protocol, tokenomics, smart contracts
• **Narrative elements**: metaKnyts characters (KnowOne, Satoshi Nakamoto, FANG Gang, BAT Pack)
• **Worldbuilding**: Terra/Digitterra dual reality framework  
• **Philosophy**: Clean Data principles, decentralized AI governance
• **Bitcoin & Crypto**: Runes, protocols, blockchain technology

${conversationId ? "I'll remember our conversation context and can reference our previous discussions naturally." : ""}

Try asking about "metaKnyts", "KnowOne", "Terra and Digitterra", "Bitcoin Runes", or any crypto/Web3 concept. I'll provide insights from both technical and narrative perspectives with proper citations.

What would you like to explore today?`,
      timestamp: new Date().toISOString(),
      metadata: {
        version: "1.0",
        modelUsed: veniceActivated ? "venice-uncensored" : "gpt-4o-mini",
        knowledgeSource: "iQube + COYN + Qripto + metaKnyts Knowledge Bases",
        qryptoItemsFound: 0,
        metaKnytsItemsFound: 0,
        citations: [],
        aiProvider: veniceActivated ? "Venice AI (Uncensored)" : "OpenAI",
        conversationMemoryUsed: !!conversationId
      }
    };
  }, [veniceActivated, conversationId]);

  // ENHANCED: Add error boundaries and content validation for navigation stability
  const processedHistoricalMessages = useMemo(() => {
    if (!interactions || interactions.length === 0) {
      return [];
    }

    console.log(`🎯 MonDAI Interface: Processing ${interactions.length} MONDAI historical interactions`);

    try {
      const historicalMessages: AgentMessage[] = [];
      
      interactions.forEach((interaction, index) => {
        try {
          // ENHANCED: Validate interaction data before processing
          if (!interaction || typeof interaction !== 'object') {
            console.warn(`⚠️ NAVIGATION FIX: Invalid interaction at index ${index}:`, interaction);
            return;
          }

          // Create user message from the query with validation
          if (interaction.query && typeof interaction.query === 'string' && interaction.query.trim()) {
            historicalMessages.push({
              id: `${interaction.id}-user`,
              sender: 'user',
              message: interaction.query.trim(),
              timestamp: interaction.created_at || new Date().toISOString(),
            });
          }
          
          // Create agent message from the response with validation
          if (interaction.response && typeof interaction.response === 'string' && interaction.response.trim()) {
            // ENHANCED: Sanitize content to prevent TypeScript rendering errors
            let sanitizedResponse = interaction.response.trim();
            
            // Remove any potentially corrupted HTML that could cause TypeScript errors
            if (sanitizedResponse.includes('<div') && !sanitizedResponse.includes('</div>')) {
              console.warn(`⚠️ NAVIGATION FIX: Corrupted HTML detected, sanitizing...`);
              sanitizedResponse = sanitizedResponse.replace(/<div[^>]*>/g, '').replace(/<\/div>/g, '');
            }
            
            historicalMessages.push({
              id: `${interaction.id}-agent`,
              sender: 'agent',
              message: sanitizedResponse,
              timestamp: interaction.created_at || new Date().toISOString(),
              metadata: interaction.metadata || undefined
            });
          }
        } catch (interactionError) {
          console.error(`❌ NAVIGATION FIX: Error processing interaction ${index}:`, interactionError);
        }
      });
      
      // Sort messages by timestamp with error handling
      const sortedMessages = historicalMessages.sort((a, b) => {
        try {
          return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        } catch (sortError) {
          console.warn('⚠️ NAVIGATION FIX: Error sorting messages, using original order');
          return 0;
        }
      });
      
      console.log(`✅ MonDAI Interface: Successfully processed ${sortedMessages.length} MONDAI historical messages`);
      return sortedMessages;
    } catch (processingError) {
      console.error('❌ NAVIGATION FIX: Critical error processing historical messages:', processingError);
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
  
  // ENHANCED: Navigation-safe conversation history loading with error boundaries
  useEffect(() => {
    const loadConversationHistory = () => {
      if (!user || isHistoryLoaded) return;
      
      try {
        console.log(`🎯 NAVIGATION FIX: Starting MONDAI conversation history load (Build: ${buildVersion})`);
        console.log(`📊 NAVIGATION DATA: Historical MONDAI messages count: ${processedHistoricalMessages.length}`);

        if (processedHistoricalMessages.length > 0) {
          console.log(`✅ NAVIGATION SUCCESS: Loaded ${processedHistoricalMessages.length} MONDAI historical messages`);
          
          // ENHANCED: Validate message integrity before setting state
          const validMessages = processedHistoricalMessages.filter(msg => {
            if (!msg || !msg.id || !msg.sender || !msg.message) {
              console.warn('⚠️ NAVIGATION FIX: Filtering out invalid message:', msg);
              return false;
            }
            return true;
          });
          
          // Log first few messages to verify content integrity
          validMessages.slice(0, 3).forEach((msg, i) => {
            console.log(`📝 NAVIGATION MESSAGE ${i + 1}:`, {
              id: msg.id,
              sender: msg.sender,
              hasHTML: msg.message.includes('<div'),
              hasMermaid: msg.message.includes('```mermaid'),
              preview: msg.message.substring(0, 50),
              isValid: typeof msg.message === 'string'
            });
          });
          
          // ENHANCED: Use navigation-safe state update
          const safeInitialMessages = [welcomeMessage, ...validMessages];
          console.log(`🔒 NAVIGATION FIX: Setting ${safeInitialMessages.length} validated messages for MONDAI`);
          setInitialMessages(safeInitialMessages);
        } else {
          // If no history, just set the welcome message
          console.log('🎯 NAVIGATION INFO: No MONDAI historical messages found, using welcome only');
          setInitialMessages([welcomeMessage]);
        }
        
        setIsHistoryLoaded(true);
        console.log('✅ NAVIGATION FIX: History loading completed successfully');
      } catch (error) {
        console.error(`❌ NAVIGATION ERROR: Failed to load MONDAI conversation history (Build: ${buildVersion}):`, error);
        // ENHANCED: Safe fallback that won't break navigation
        try {
          setInitialMessages([welcomeMessage]);
          setIsHistoryLoaded(true);
        } catch (fallbackError) {
          console.error('❌ NAVIGATION CRITICAL: Even fallback failed:', fallbackError);
        }
      }
    };

    loadConversationHistory();
  }, [user, processedHistoricalMessages, welcomeMessage, isHistoryLoaded, buildVersion]);

  // Memoized refresh function to prevent unnecessary recreations
  const memoizedRefreshInteractions = useCallback(() => {
    return refreshInteractions();
  }, [refreshInteractions]);

  // Enhanced reset conversation with better logging
  const handleResetConversation = useCallback(() => {
    console.log('🔄 MonDAI Interface: User requested conversation reset');
    resetConversation();
    // Optionally refresh the page to clear all state
    // window.location.reload();
  }, [resetConversation]);

  return (
    <div className="h-screen flex flex-col">
      <SimplifiedAgentInterface
        title="Aigent Nakamoto"
        description={`Crypto-Agentic AI for iQube + COYN + Qripto + metaKnyts ${veniceActivated ? '(Venice AI)' : '(OpenAI)'} ${conversationId ? '🧠' : '💭'} [${buildVersion.substring(0, 8)}]`}
        agentType="mondai" 
        onMessageSubmit={handleAIMessage}
        conversationId={conversationId}
        initialMessages={initialMessages}
        additionalActions={
          conversationId ? (
            <button
              onClick={handleResetConversation}
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
              title="Start a new conversation (clears memory)"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                <path d="M3 21v-5h5" />
              </svg>
              <span className="hidden sm:inline">Reset Memory</span>
            </button>
          ) : undefined
        }
      />
    </div>
  );
});

SimplifiedMonDAIInterface.displayName = 'SimplifiedMonDAIInterface';

export default SimplifiedMonDAIInterface;
