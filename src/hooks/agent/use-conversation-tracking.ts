
import { useState, useRef, useEffect } from 'react';
import { AgentMessage } from '@/lib/types';
import { useMCP } from '@/hooks/use-mcp';

interface UseConversationTrackingProps {
  initialMessages: AgentMessage[];
  conversationId: string | null;
  setConversationId: (id: string | null) => void;
  agentType: 'learn' | 'earn' | 'connect';
}

export const useConversationTracking = ({
  initialMessages,
  conversationId: externalConversationId,
  setConversationId,
  agentType
}: UseConversationTrackingProps) => {
  const [playing, setPlaying] = useState<string | null>(null);
  const [isHistoryLoaded, setIsHistoryLoaded] = useState(false);
  const [conversationId, setInternalConversationId] = useState<string | null>(externalConversationId || null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { client: mcpClient, initializeContext } = useMCP();

  // Initialize MCP context when component mounts
  useEffect(() => {
    const setupMCP = async () => {
      if (mcpClient) {
        // If external conversation ID is provided, use it, otherwise initialize new
        const convId = await initializeContext(externalConversationId);
        if (convId) {
          console.log(`MCP: Initialized context for ${agentType} agent with ID: ${convId}`);
          setInternalConversationId(convId);
          setConversationId(convId);
        }
      }
    };
    
    setupMCP();
  }, [mcpClient, initializeContext, agentType, externalConversationId, setConversationId]);
  
  // Update conversationId if external one changes
  useEffect(() => {
    if (externalConversationId !== undefined && externalConversationId !== conversationId) {
      setInternalConversationId(externalConversationId);
    }
  }, [externalConversationId, conversationId]);

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
    playing,
    setPlaying,
    isHistoryLoaded,
    setIsHistoryLoaded,
    conversationId,
    messagesEndRef,
    handlePlayAudio
  };
};
