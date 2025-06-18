
import React from 'react';
import { AgentMessage } from '@/lib/types';
import MessageContent from './message/MessageContent';
import MessageMetadata from './message/MessageMetadata';
import AgentRecommendations from './message/AgentRecommendations';
import AgentActivationModal from './AgentActivationModal';
import { useAgentRecommendations } from './hooks/useAgentRecommendations';
import { useAgentActivation } from './hooks/useAgentActivation';

interface MessageItemProps {
  message: AgentMessage;
  isPlaying: boolean;
  onPlayAudio: (messageId: string) => void;
}

const MessageItem = ({ message, isPlaying, onPlayAudio }: MessageItemProps) => {
  const { recommendations, dismissRecommendation } = useAgentRecommendations(message);
  const {
    showActivationModal,
    selectedAgent,
    metisActive,
    handleActivateAgent,
    handleConfirmPayment,
    handleActivationComplete,
    closeActivationModal
  } = useAgentActivation();

  // Add special styling for system messages
  const getMessageClass = () => {
    if (message.sender === 'user') return 'user-message';
    if (message.sender === 'system') return 'system-message';
    return 'agent-message';
  };

  return (
    <div className={getMessageClass()}>
      <div className="flex">
        <div className="flex-1">
          <MessageMetadata 
            message={message}
            metisActive={metisActive}
            isPlaying={isPlaying}
            onPlayAudio={onPlayAudio}
          />
          
          {/* Apply formatted message content */}
          <div className={`prose prose-sm max-w-none ${message.sender === 'system' ? 'text-amber-700' : ''}`}>
            <MessageContent content={message.message} sender={message.sender} />
          </div>
          
          {/* Agent Recommendations */}
          <AgentRecommendations
            showMetisRecommendation={recommendations.showMetisRecommendation}
            showVeniceRecommendation={recommendations.showVeniceRecommendation}
            showQryptoRecommendation={recommendations.showQryptoRecommendation}
            showKNYTRecommendation={recommendations.showKNYTRecommendation}
            onActivateAgent={handleActivateAgent}
            onDismissRecommendation={dismissRecommendation}
          />
        </div>
      </div>
      
      {selectedAgent && (
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
};

export default MessageItem;
