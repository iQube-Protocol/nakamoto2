
import React from 'react';
import { AgentMessage } from '@/lib/types';
import MessageList from '../MessageList';
import EmptyConversation from '../EmptyConversation';

interface ChatTabProps {
  messages: AgentMessage[];
  isProcessing: boolean;
  playing: string | null;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  onPlayAudio: (messageId: string) => void;
  agentType: 'learn' | 'earn' | 'connect';
}

const ChatTab: React.FC<ChatTabProps> = ({
  messages,
  isProcessing,
  playing,
  messagesEndRef,
  onPlayAudio,
  agentType
}) => {
  return (
    <>
      {messages.length === 0 ? (
        <EmptyConversation agentType={agentType} />
      ) : (
        <MessageList
          messages={messages}
          isProcessing={isProcessing}
          playing={playing}
          onPlayAudio={onPlayAudio}
          messagesEndRef={messagesEndRef}
        />
      )}
    </>
  );
};

export default ChatTab;
