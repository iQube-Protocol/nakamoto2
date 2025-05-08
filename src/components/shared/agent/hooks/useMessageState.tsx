
import { useState } from 'react';
import { AgentMessage } from '@/lib/types';

/**
 * Hook to manage the state of messages in the agent chat
 */
export const useMessageState = (initialMessages: AgentMessage[] = []) => {
  const [messages, setMessages] = useState<AgentMessage[]>(initialMessages);
  
  return {
    messages,
    setMessages
  };
};
