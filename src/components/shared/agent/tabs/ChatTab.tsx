
import React from 'react';
import { AgentMessage } from '@/lib/types';
import MessageList from '../MessageList';
import AgentInputBar from '../AgentInputBar';
import EmptyConversation from '../EmptyConversation';

interface ChatTabProps {
  messages: AgentMessage[];
  inputValue: string;
  isProcessing: boolean;
  playing: string | null;
  agentType: 'learn' | 'earn' | 'connect';
  messagesEndRef: React.RefObject<HTMLDivElement>;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  handlePlayAudio: (messageId: string) => void;
}

const ChatTab: React.FC<ChatTabProps> = ({
  messages,
  inputValue,
  isProcessing,
  playing,
  agentType,
  messagesEndRef,
  handleInputChange,
  handleSubmit,
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
            isProcessing={isProcessing} 
            playing={playing} 
            onPlayAudio={handlePlayAudio} 
            messagesEndRef={messagesEndRef}
          />
        )}
      </div>

      <div className="mt-auto">
        <AgentInputBar
          inputValue={inputValue}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          isProcessing={isProcessing}
          agentType={agentType}
        />
      </div>
    </div>
  );
};

export default ChatTab;
