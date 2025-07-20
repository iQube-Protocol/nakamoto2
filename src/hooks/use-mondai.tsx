
import { useState, useCallback } from 'react';
import { generateAigentNakamotoResponse } from '@/services/qrypto-mondai-service';
import { AgentMessage } from '@/lib/types';
import { useVeniceAgent } from '@/hooks/use-venice-agent';

export const useMondAI = () => {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [documentUpdates, setDocumentUpdates] = useState(0);
  const { veniceActivated } = useVeniceAgent();

  const handleAIMessage = useCallback(async (message: string): Promise<AgentMessage> => {
    try {
      console.log(`🔄 MonDAI Hook: Processing message with Venice ${veniceActivated ? 'ENABLED' : 'DISABLED'}`);
      console.log(`🔧 MonDAI Hook: Venice state in useMondAI:`, veniceActivated);
      
      // Generate conversation ID on first message if not already set
      let currentConversationId = conversationId;
      if (!currentConversationId) {
        currentConversationId = crypto.randomUUID();
        setConversationId(currentConversationId);
        console.log(`🆕 MonDAI Hook: Generated new conversation ID: ${currentConversationId}`);
      } else {
        console.log(`🔄 MonDAI Hook: Using existing conversation ID: ${currentConversationId}`);
      }
      
      const response = await generateAigentNakamotoResponse(
        message, 
        currentConversationId,
        veniceActivated // Pass Venice toggle state
      );
      
      // Ensure conversation ID is consistent
      if (response.conversationId !== currentConversationId) {
        console.warn(`⚠️ MonDAI Hook: Conversation ID mismatch. Expected: ${currentConversationId}, Got: ${response.conversationId}`);
        setConversationId(response.conversationId);
      }

      console.log(`✅ MonDAI Hook: Response received from ${response.metadata.aiProvider || (veniceActivated ? 'Venice AI' : 'OpenAI')}`);
      
      if (response.metadata.personaContextUsed) {
        console.log(`🧠 MonDAI Hook: Personalized response for ${response.metadata.preferredName || 'user'}`);
      }

      if (response.metadata.conversationMemoryUsed) {
        console.log(`🧠 MonDAI Hook: Used conversation memory with themes: ${response.metadata.memoryThemes?.join(', ') || 'none'}`);
        console.log(`🧠 MonDAI Hook: Memory included ${response.metadata.recentExchangeCount || 0} recent exchanges`);
      }

      return {
        id: Date.now().toString(),
        sender: 'agent',
        message: response.message,
        timestamp: response.timestamp,
        metadata: response.metadata
      };
    } catch (error) {
      console.error('❌ MonDAI Hook: Error in handleAIMessage:', error);
      throw error;
    }
  }, [conversationId, veniceActivated]);

  const handleDocumentContextUpdated = useCallback(() => {
    setDocumentUpdates(prev => prev + 1);
  }, []);

  // Reset conversation (useful for starting fresh conversations)
  const resetConversation = useCallback(() => {
    const oldConversationId = conversationId;
    setConversationId(null);
    console.log(`🔄 MonDAI Hook: Conversation reset from ${oldConversationId} to fresh start`);
  }, [conversationId]);

  return {
    conversationId,
    documentUpdates,
    handleAIMessage,
    handleDocumentContextUpdated,
    resetConversation,
  };
};
