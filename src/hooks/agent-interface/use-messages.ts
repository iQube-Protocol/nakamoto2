
import { useState, useRef, useEffect } from 'react';
import { AgentMessage } from '@/lib/types';
import { processAgentInteraction } from '@/services/agent-service';
import { toast } from 'sonner';
import { useMCP } from '@/hooks/use-mcp';

interface UseMessagesProps {
  agentType: 'learn' | 'earn' | 'connect';
  initialMessages: AgentMessage[];
  conversationId: string | null;
  onMessageSubmit?: (message: string) => Promise<AgentMessage>;
  refreshInteractions: () => Promise<void>;
  user: any | null;
}

export const useMessages = ({
  agentType,
  initialMessages,
  conversationId,
  onMessageSubmit,
  refreshInteractions,
  user
}: UseMessagesProps) => {
  const [messages, setMessages] = useState<AgentMessage[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [playing, setPlaying] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { client: mcpClient } = useMCP();
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isProcessing) return;

    const userMessage: AgentMessage = {
      id: Date.now().toString(),
      sender: 'user',
      message: inputValue,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
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
        
        setMessages(prev => [...prev, agentResponse]);
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

        setMessages(prev => [...prev, newAgentMessage]);
      }
      
      // After processing, refresh interactions to update the list
      if (user) {
        setTimeout(() => {
          refreshInteractions();
        }, 1000); // Small delay to ensure database has time to update
      }
    } catch (error) {
      console.error('Error handling message:', error);
      toast.error('There was a problem with your request');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePlayAudio = (messageId: string) => {
    if (playing === messageId) {
      setPlaying(null);
    } else {
      setPlaying(messageId);
      setTimeout(() => {
        if (playing === messageId) {
          setPlaying(null);
        }
      }, 5000);
    }
  };

  return {
    messages,
    inputValue,
    isProcessing,
    playing,
    messagesEndRef,
    handleInputChange,
    handleSubmit,
    handlePlayAudio,
    setMessages
  };
};
