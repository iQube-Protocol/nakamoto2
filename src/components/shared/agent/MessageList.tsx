
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
  recommendations?: {
    showMetisRecommendation: boolean;
    showVeniceRecommendation: boolean;
    showQryptoRecommendation: boolean;
    showKNYTRecommendation: boolean;
  };
  onActivateAgent?: (agentName: string, fee: number, description: string) => void;
  onDismissRecommendation?: (agentName: string) => void;
}

const MessageList = ({
  messages,
  isProcessing,
  playing,
  onPlayAudio,
  messagesEndRef,
  recommendations,
  onActivateAgent,
  onDismissRecommendation
}: MessageListProps) => {
  return (
    <div className="flex-1 h-full overflow-hidden">
      <ScrollArea className="h-full">
        <div className="p-4 pb-2 space-y-4">
          {messages.map((msg, index) => {
            // Only show recommendations on the last agent message
            const isLastAgentMessage = index === messages.length - 1 && msg.sender === 'agent';
            
            return (
              <MessageItem 
                key={msg.id} 
                message={msg} 
                isPlaying={playing === msg.id}
                onPlayAudio={onPlayAudio}
                recommendations={isLastAgentMessage ? recommendations : undefined}
                onActivateAgent={onActivateAgent}
                onDismissRecommendation={onDismissRecommendation}
              />
            );
          })}
          
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
