
import { useState } from 'react';
import { AgentMessage } from '@/lib/types';
import { toast } from 'sonner';
import { processAgentInteraction } from '@/services/agent-service';
import { useUserInteractions } from '@/hooks/use-user-interactions';
import { useMCP } from '@/hooks/use-mcp';

interface UseMessageHandlingProps {
  agentType: 'learn' | 'earn' | 'connect';
  user: any | null;
  onMessageSubmit?: (message: string) => Promise<AgentMessage>;
  conversationId: string | null;
}

export const useMessageHandling = ({
  agentType,
  user,
  onMessageSubmit,
  conversationId
}: UseMessageHandlingProps) => {
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { refreshInteractions } = useUserInteractions(agentType);
  const { client: mcpClient } = useMCP();

  const addUserMessage = (userMessage: AgentMessage) => {
    setMessages(prev => [...prev, userMessage]);
  };

  const addAgentMessage = (agentMessage: AgentMessage) => {
    setMessages(prev => [...prev, agentMessage]);
  };

  const handleSubmit = async (inputValue: string): Promise<boolean> => {
    if (!inputValue.trim() || isProcessing) return false;

    const userMessage: AgentMessage = {
      id: Date.now().toString(),
      sender: 'user',
      message: inputValue,
      timestamp: new Date().toISOString(),
    };

    addUserMessage(userMessage);
    setIsProcessing(true);

    // Add user message to MCP context if available
    if (mcpClient && conversationId) {
      await mcpClient.addUserMessage(userMessage.message);
    }

    try {
      if (onMessageSubmit) {
        const agentResponse = await onMessageSubmit(userMessage.message);
        
        // Add agent response to MCP context if available
        if (mcpClient && conversationId) {
          await mcpClient.addAgentResponse(agentResponse.message);
        }
        
        addAgentMessage(agentResponse);
      } else {
        // Fallback for when no onMessageSubmit is provided
        // Also store this interaction in the database for consistency
        let agentResponse = '';
        
        switch (agentType) {
          case 'learn':
            agentResponse = `I'm your Learning Agent. Based on your iQube data, I recommend exploring topics related to ${Math.random() > 0.5 ? 'DeFi protocols' : 'NFT marketplaces'}. Would you like me to provide more information?`;
            break;
          case 'earn':
            agentResponse = `I'm your Earning Agent. Your MonDAI tokens have increased by ${(Math.random() * 5).toFixed(2)}% today. Would you like to see potential staking opportunities based on your iQube profile?`;
            break;
          case 'connect':
            agentResponse = `I'm your Connection Agent. Based on your interests in your iQube, I found ${Math.floor(Math.random() * 10) + 1} community members with similar interests in ${Math.random() > 0.5 ? 'DeFi' : 'NFTs'}. Would you like me to introduce you?`;
            break;
        }

        // Process and store the interaction
        if (user) {
          const result = await processAgentInteraction(
            userMessage.message,
            agentType,
            agentResponse
          );
          
          if (!result.success) {
            console.error('Failed to process agent interaction:', result.error);
          }
        }

        const newAgentMessage: AgentMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'agent',
          message: agentResponse,
          timestamp: new Date().toISOString(),
        };

        addAgentMessage(newAgentMessage);
      }
      
      // After processing, refresh interactions to update the list
      if (user) {
        setTimeout(() => {
          refreshInteractions();
        }, 1000); // Small delay to ensure database has time to update
      }
      
      return true;
    } catch (error) {
      console.error('Error handling message:', error);
      toast.error('There was a problem with your request');
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    messages,
    isProcessing,
    addUserMessage,
    addAgentMessage,
    handleSubmit,
    setMessages
  };
};
