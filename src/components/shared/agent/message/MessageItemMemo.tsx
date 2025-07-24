
import React from 'react';
import { AgentMessage } from '@/lib/types';
import MessageContent from './MessageContent';
import AudioPlayback from './AudioPlayback';
import MessageMetadata from './MessageMetadata';
import AgentRecommendations from './AgentRecommendations';

interface MessageItemProps {
  message: AgentMessage;
  isPlaying?: boolean;
  onPlayAudio?: (messageId: string) => void;
  recommendations?: {
    showMetisRecommendation: boolean;
    showVeniceRecommendation: boolean;
    showQryptoRecommendation: boolean;
    showKNYTRecommendation: boolean;
  };
  onActivateAgent?: (agentName: string, fee: number, description: string) => void;
  onDismissRecommendation?: (agentName: string) => void;
}

const MessageItemMemo: React.FC<MessageItemProps> = React.memo(({ 
  message, 
  isPlaying = false, 
  onPlayAudio,
  recommendations,
  onActivateAgent,
  onDismissRecommendation
}) => {
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

      {/* Show recommendations after agent responses */}
      {!isUser && !isSystem && recommendations && onActivateAgent && onDismissRecommendation && (
        <AgentRecommendations
          showMetisRecommendation={recommendations.showMetisRecommendation}
          showVeniceRecommendation={recommendations.showVeniceRecommendation}
          showQryptoRecommendation={recommendations.showQryptoRecommendation}
          showKNYTRecommendation={recommendations.showKNYTRecommendation}
          onActivateAgent={onActivateAgent}
          onDismissRecommendation={onDismissRecommendation}
        />
      )}
    </div>
  );
});

MessageItemMemo.displayName = 'MessageItemMemo';

export default MessageItemMemo;
