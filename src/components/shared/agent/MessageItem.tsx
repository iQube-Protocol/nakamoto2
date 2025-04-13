
import React from 'react';
import { AgentMessage } from '@/lib/types';
import MessageContent from './message/MessageContent';
import AudioPlayback from './message/AudioPlayback';
import MetadataBadge from './message/MetadataBadge';

interface MessageItemProps {
  message: AgentMessage;
  isPlaying: boolean;
  onPlayAudio: (messageId: string) => void;
}

const MessageItem = ({ message, isPlaying, onPlayAudio }: MessageItemProps) => {
  return (
    <div className={message.sender === 'user' ? 'user-message' : 'agent-message'}>
      <div className="flex">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            {message.sender === 'agent' && message.metadata && (
              <MetadataBadge metadata={message.metadata} />
            )}
          </div>
          
          {/* Apply formatted message content */}
          <div className="prose prose-sm max-w-none">
            <MessageContent content={message.message} sender={message.sender} />
          </div>
          
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-muted-foreground">
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            {message.sender === 'agent' && (
              <AudioPlayback 
                isPlaying={isPlaying} 
                messageId={message.id} 
                onPlayAudio={onPlayAudio} 
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageItem;
