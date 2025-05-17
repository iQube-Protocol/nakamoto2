
import React from 'react';
import { AgentMessage } from '@/lib/types';
import MessageList from '../MessageList';
import EmptyConversation from '../EmptyConversation';

interface ChatTabProps {
  messages: AgentMessage[];
  playing: string | null;
  agentType: 'learn' | 'earn' | 'connect';
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
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <EmptyConversation agentType={agentType} />
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
    </div>
  );
};

export default ChatTab;
