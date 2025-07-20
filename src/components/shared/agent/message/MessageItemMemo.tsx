import React from 'react';
import { AgentMessage } from '@/lib/types';
import MessageContent from './MessageContent';
import AudioPlayback from './AudioPlayback';
import MessageMetadata from './MessageMetadata';

interface MessageItemProps {
  message: AgentMessage;
  isPlaying?: boolean;
  onPlayAudio?: (messageId: string) => void;
}

const MessageItemMemo: React.FC<MessageItemProps> = React.memo(({ message, isPlaying = false, onPlayAudio }) => {
  // Keep exact same structure and functionality
  const isUser = message.sender === 'user';
  const isSystem = message.sender === 'system';
  
  return (
    <div className={`message-item ${isUser ? 'user-message' : isSystem ? 'system-message' : 'agent-message'}`}>
      <div className="message-content">
        <MessageContent content={message.message} sender={message.sender} />
        
        {!isUser && onPlayAudio && (
          <AudioPlayback
            messageId={message.id}
            isPlaying={isPlaying}
            onPlayAudio={onPlayAudio}
          />
        )}
        
        {message.metadata && (
          <MessageMetadata 
            message={message} 
            metisActive={false} 
            isPlaying={isPlaying || false} 
            onPlayAudio={onPlayAudio || (() => {})} 
          />
        )}
      </div>
    </div>
  );
});

MessageItemMemo.displayName = 'MessageItemMemo';

export default MessageItemMemo;
