import React from 'react';
import { AgentMessage } from '@/lib/types';
import MessageContent from './MessageContent';
import AudioPlayback from './AudioPlayback';
import MessageMetadata from './MessageMetadata';
import AgentRecommendations from './AgentRecommendations';
import { useAgentActivation } from '../hooks/useAgentActivation';
import AgentActivationModal from '../AgentActivationModal';

interface RecommendationState {
  showVeniceRecommendation: boolean;
  showQryptoRecommendation: boolean;
  showKNYTRecommendation: boolean;
  triggeredByMessageId?: string;
}

interface MessageItemProps {
  message: AgentMessage;
  isPlaying?: boolean;
  onPlayAudio?: (messageId: string) => void;
  recommendations?: RecommendationState;
  onDismissRecommendation?: (agentName: string) => void;
}

const MessageItemMemo: React.FC<MessageItemProps> = React.memo(({ 
  message, 
  isPlaying = false, 
  onPlayAudio, 
  recommendations,
  onDismissRecommendation 
}) => {
  // Keep exact same structure and functionality
  const isUser = message.sender === 'user';
  const isSystem = message.sender === 'system';
  
  // Agent activation logic
  const { 
    handleActivateAgent, 
    showActivationModal, 
    selectedAgent, 
    handleConfirmPayment, 
    handleActivationComplete, 
    closeActivationModal 
  } = useAgentActivation(onDismissRecommendation);
  
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
        
        {/* Show agent recommendations after agent messages when triggered by user messages */}
        {!isUser && !isSystem && recommendations && onDismissRecommendation && (
          <AgentRecommendations
            showMetisRecommendation={false} // Exclude Metis from auto-activation as per requirements
            showVeniceRecommendation={recommendations.showVeniceRecommendation}
            showQryptoRecommendation={recommendations.showQryptoRecommendation}
            showKNYTRecommendation={recommendations.showKNYTRecommendation}
            onActivateAgent={handleActivateAgent}
            onDismissRecommendation={onDismissRecommendation}
          />
        )}
      </div>
      
      {/* Agent Activation Modal */}
      {showActivationModal && selectedAgent && (
        <AgentActivationModal
          isOpen={showActivationModal}
          onClose={closeActivationModal}
          agentName={selectedAgent.name}
          fee={selectedAgent.fee}
          onConfirmPayment={handleConfirmPayment}
          onComplete={handleActivationComplete}
        />
      )}
    </div>
  );
});

MessageItemMemo.displayName = 'MessageItemMemo';

export default MessageItemMemo;
