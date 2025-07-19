
import React from 'react';
import { AgentMessage } from '@/lib/types';
import MessageContent from './message/MessageContent';
import MessageMetadata from './message/MessageMetadata';
import AudioPlayback from './message/AudioPlayback';

interface MessageItemProps {
  message: AgentMessage;
  isPlaying: boolean;
  onPlayAudio: (messageId: string) => void;
}

const MessageItem = React.memo(({ message, isPlaying, onPlayAudio }: MessageItemProps) => {
  const isUser = message.sender === 'user';
  const isSystem = message.sender === 'system';
  
  return (
    <div className={`message-item ${isUser ? 'user-message' : isSystem ? 'system-message' : 'agent-message'}`}>
      <div className="message-content-wrapper">
        <MessageContent content={message.message} sender={message.sender} />
        {!isUser && !isSystem && (
          <div className="message-controls">
            <AudioPlayback
              messageId={message.id}
              isPlaying={isPlaying}
              onPlayAudio={onPlayAudio}
            />
          </div>
        )}
      </div>
      {message.metadata && (
        <MessageMetadata 
          message={message} 
          metisActive={false} 
          isPlaying={isPlaying} 
          onPlayAudio={onPlayAudio} 
        />
      )}
    </div>
  );
});

MessageItem.displayName = 'MessageItem';

export default MessageItem;
