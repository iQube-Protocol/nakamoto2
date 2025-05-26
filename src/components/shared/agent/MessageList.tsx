
import React from 'react';
import { AgentMessage } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import MessageItem from './MessageItem';

interface MessageListProps {
  messages: AgentMessage[];
  isProcessing: boolean;
  playing: string | null;
  onPlayAudio: (messageId: string) => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

const MessageList = ({
  messages,
  isProcessing,
  playing,
  onPlayAudio,
  messagesEndRef
}: MessageListProps) => {
  return (
    <div className="flex-1 h-full overflow-hidden">
      <ScrollArea className="h-full">
        <div className="p-4 pb-2 space-y-4">
          {messages.map((msg) => (
            <MessageItem 
              key={msg.id} 
              message={msg} 
              isPlaying={playing === msg.id}
              onPlayAudio={onPlayAudio}
            />
          ))}
          
          {isProcessing && (
            <div className="agent-message">
              <div className="flex space-x-2 items-center">
                <div className="w-2 h-2 rounded-full bg-iqube-primary animate-pulse"></div>
                <div className="w-2 h-2 rounded-full bg-iqube-primary animate-pulse" style={{animationDelay: '0.2s'}}></div>
                <div className="w-2 h-2 rounded-full bg-iqube-primary animate-pulse" style={{animationDelay: '0.4s'}}></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
    </div>
  );
};

export default MessageList;
