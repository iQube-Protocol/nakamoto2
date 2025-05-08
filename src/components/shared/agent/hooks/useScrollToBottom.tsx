
import { useEffect, useRef } from 'react';
import { AgentMessage } from '@/lib/types';

/**
 * Hook to automatically scroll to the bottom of the message list
 */
export const useScrollToBottom = (messages: AgentMessage[]) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto scroll to bottom when new messages come in
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  return messagesEndRef;
};
