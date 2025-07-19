
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
        <MessageContent message={message} />
        {!isUser && !isSystem && (
          <div className="message-controls">
            <AudioPlayback
              message={message}
              isPlaying={isPlaying}
              onPlayAudio={onPlayAudio}
            />
          </div>
        )}
      </div>
      {message.metadata && <MessageMetadata metadata={message.metadata} />}
    </div>
  );
});

MessageItem.displayName = 'MessageItem';

export default MessageItem;
