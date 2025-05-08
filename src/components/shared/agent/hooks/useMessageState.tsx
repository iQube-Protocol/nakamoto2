
import { useState } from 'react';
import { AgentMessage } from '@/lib/types';

/**
 * Hook to manage the state of messages in the agent chat
 */
export const useMessageState = (initialMessages: AgentMessage[] = []) => {
  const [messages, setMessages] = useState<AgentMessage[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [playing, setPlaying] = useState<string | null>(null);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
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
    setMessages,
    inputValue,
    setInputValue,
    isProcessing, 
    setIsProcessing,
    playing,
    setPlaying,
    handleInputChange,
    handlePlayAudio
  };
};
