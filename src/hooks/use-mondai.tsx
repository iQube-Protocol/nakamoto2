
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
      
      const response = await generateAigentNakamotoResponse(
        message, 
        conversationId,
        veniceActivated // Pass Venice toggle state
      );
      
      // Update conversation ID if it was generated
      if (!conversationId) {
        setConversationId(response.conversationId);
      }

      console.log(`✅ MonDAI: Response received from ${response.metadata.aiProvider || (veniceActivated ? 'Venice AI' : 'OpenAI')}`);

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

  return {
    conversationId,
    documentUpdates,
    handleAIMessage,
    handleDocumentContextUpdated,
  };
};
