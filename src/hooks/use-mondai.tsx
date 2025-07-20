
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
      console.log(`🔄 MonDAI: Processing message with Venice ${veniceActivated ? 'ENABLED' : 'DISABLED'}`);
      console.log(`🔧 MonDAI: Venice state in useMondAI:`, veniceActivated);
      
      // Generate conversation ID on first message if not already set
      let currentConversationId = conversationId;
      if (!currentConversationId) {
        currentConversationId = crypto.randomUUID();
        setConversationId(currentConversationId);
        console.log(`🆕 MonDAI: Generated new conversation ID: ${currentConversationId}`);
      }
      
      const response = await generateAigentNakamotoResponse(
        message, 
        currentConversationId,
        veniceActivated // Pass Venice toggle state
      );
      
      // Ensure conversation ID is consistent
      if (response.conversationId !== currentConversationId) {
        console.warn(`⚠️ MonDAI: Conversation ID mismatch. Expected: ${currentConversationId}, Got: ${response.conversationId}`);
        setConversationId(response.conversationId);
      }

      console.log(`✅ MonDAI: Response received from ${response.metadata.aiProvider || (veniceActivated ? 'Venice AI' : 'OpenAI')}`);
      
      if (response.metadata.personaContextUsed) {
        console.log(`🧠 MonDAI: Personalized response for ${response.metadata.preferredName || 'user'}`);
      }

      if (response.metadata.conversationMemoryUsed) {
        console.log(`🧠 MonDAI: Used conversation memory with themes: ${response.metadata.memoryThemes?.join(', ') || 'none'}`);
      }

      return {
        id: Date.now().toString(),
        sender: 'agent',
        message: response.message,
        timestamp: response.timestamp,
        metadata: response.metadata
      };
    } catch (error) {
      console.error('Error in MonDAI handleAIMessage:', error);
      throw error;
    }
  }, [conversationId, veniceActivated]);

  const handleDocumentContextUpdated = useCallback(() => {
    setDocumentUpdates(prev => prev + 1);
  }, []);

  // Reset conversation (useful for starting fresh conversations)
  const resetConversation = useCallback(() => {
    setConversationId(null);
    console.log('🔄 MonDAI: Conversation reset');
  }, []);

  return {
    conversationId,
    documentUpdates,
    handleAIMessage,
    handleDocumentContextUpdated,
    resetConversation,
  };
};
