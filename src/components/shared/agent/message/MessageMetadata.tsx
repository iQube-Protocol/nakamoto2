
import React from 'react';
import { AgentMessage } from '@/lib/types';
import MetadataBadge from './MetadataBadge';
import AudioPlayback from './AudioPlayback';

interface MessageMetadataProps {
  message: AgentMessage;
  metisActive: boolean;
  isPlaying: boolean;
  onPlayAudio: (messageId: string) => void;
  onModelChange?: (model: string, provider: 'openai' | 'venice') => void;
}

const MessageMetadata = ({ message, metisActive, isPlaying, onPlayAudio, onModelChange }: MessageMetadataProps) => {
  return (
    <>
      <div className="flex items-center justify-between mb-1">
        {message.sender === 'agent' && (
          <MetadataBadge 
            metadata={message.metadata ? { 
              ...message.metadata,
              metisActive: message.metadata.metisActive || metisActive
            } : { metisActive: metisActive }} 
            onModelChange={onModelChange}
          />
        )}
        {message.sender === 'system' && (
          <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
            System
          </span>
        )}
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
    </>
  );
};

export default MessageMetadata;
