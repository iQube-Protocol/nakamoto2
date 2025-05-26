
import React, { useEffect, useRef } from 'react';
import { AgentMessage } from '@/lib/types';
import MessageList from '../MessageList';
import EmptyConversation from '../EmptyConversation';

interface ChatTabProps {
  messages: AgentMessage[];
  playing: string | null;
  agentType: 'learn' | 'earn' | 'connect' | 'mondai';
  messagesEndRef: React.RefObject<HTMLDivElement>;
  handlePlayAudio: (messageId: string) => void;
}

const ChatTab: React.FC<ChatTabProps> = ({
  messages,
  playing,
  agentType,
  messagesEndRef,
  handlePlayAudio
}) => {
  // Effect to scroll to the latest message whenever messages change or on initial load
  useEffect(() => {
    if (messagesEndRef.current && messages.length > 0) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, messagesEndRef]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {messages.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <EmptyConversation agentType={agentType} />
        </div>
      ) : (
        <MessageList 
          messages={messages} 
          isProcessing={false} // This is now controlled at the parent level
          playing={playing} 
          onPlayAudio={handlePlayAudio} 
          messagesEndRef={messagesEndRef}
        />
      )}
    </div>
  );
};

export default ChatTab;
