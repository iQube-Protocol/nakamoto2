
import React, { useState, useEffect } from 'react';
import { AgentMessage } from '@/lib/types';
import MessageContent from './message/MessageContent';
import AudioPlayback from './message/AudioPlayback';
import MetadataBadge from './message/MetadataBadge';
import AgentRecommendation from './AgentRecommendation';
import AgentActivationModal from './AgentActivationModal';
import { useToast } from '@/components/ui/use-toast';

interface MessageItemProps {
  message: AgentMessage;
  isPlaying: boolean;
  onPlayAudio: (messageId: string) => void;
}

const MessageItem = ({ message, isPlaying, onPlayAudio }: MessageItemProps) => {
  const { toast } = useToast();
  const [showMetisRecommendation, setShowMetisRecommendation] = useState(false);
  const [showVeniceRecommendation, setShowVeniceRecommendation] = useState(false);
  const [showQryptoRecommendation, setShowQryptoRecommendation] = useState(false);
  const [showActivationModal, setShowActivationModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<{name: string, fee: number, description: string} | null>(null);
  const [metisActive, setMetisActive] = useState(false);

  // Check for trigger words in user messages
  useEffect(() => {
    if (message.sender === 'user') {
      const lowerMessage = message.message.toLowerCase();
      
      // Metis trigger words: crypto-risk related
      const hasMetisTrigger = 
        lowerMessage.includes('risk') && 
        (lowerMessage.includes('token') || 
         lowerMessage.includes('wallet') || 
         lowerMessage.includes('crypto') || 
         lowerMessage.includes('blockchain'));
      
      // Venice trigger words: privacy/censorship
      const hasVeniceTrigger = 
        lowerMessage.includes('privacy') || 
        lowerMessage.includes('censorship');
      
      // Qrypto Profile trigger words: personalize/customize
      const hasQryptoTrigger = 
        lowerMessage.includes('personalize') || 
        lowerMessage.includes('personalise') || 
        lowerMessage.includes('customize') || 
        lowerMessage.includes('custom');
      
      // Show recommendations with delay
      if (hasMetisTrigger) {
        setTimeout(() => setShowMetisRecommendation(true), 1000);
      }
      
      if (hasVeniceTrigger) {
        setTimeout(() => setShowVeniceRecommendation(true), 1000);
      }
      
      if (hasQryptoTrigger) {
        setTimeout(() => setShowQryptoRecommendation(true), 1000);
      }
    }
  }, [message]);

  const handleActivateAgent = (agentName: string, fee: number, description: string) => {
    setSelectedAgent({ name: agentName, fee, description });
    setShowActivationModal(true);
    
    // Hide the relevant recommendation
    if (agentName === 'Metis') setShowMetisRecommendation(false);
    if (agentName === 'Venice') setShowVeniceRecommendation(false);
    if (agentName === 'Qrypto Persona') setShowQryptoRecommendation(false);
  };

  const handleDismissRecommendation = (agentName: string) => {
    if (agentName === 'Metis') setShowMetisRecommendation(false);
    if (agentName === 'Venice') setShowVeniceRecommendation(false);
    if (agentName === 'Qrypto Persona') setShowQryptoRecommendation(false);
    
    toast({
      title: "Recommendation dismissed",
      description: `You can always activate ${agentName} agent later by mentioning relevant keywords again.`,
      variant: "default",
    });
  };

  const handleConfirmPayment = async (): Promise<boolean> => {
    // Simulate payment processing
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true); // Always succeed for demo purposes
      }, 3000);
    });
  };

  const handleActivationComplete = () => {
    if (selectedAgent?.name === 'Metis') {
      setMetisActive(true);
      window.dispatchEvent(new CustomEvent('metisActivated'));
    }
    
    toast({
      title: `${selectedAgent?.name} Agent Activated`,
      description: `You now have access to ${selectedAgent?.name} capabilities.`,
      variant: "default",
    });
    
    setSelectedAgent(null);
  };

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
          <div className="flex items-center justify-between mb-1">
            {message.sender === 'agent' && (
              <MetadataBadge 
                metadata={message.metadata ? { 
                  ...message.metadata,
                  metisActive: message.metadata.metisActive || metisActive
                } : { metisActive: metisActive }} 
              />
            )}
            {message.sender === 'system' && (
              <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                System
              </span>
            )}
          </div>
          
          {/* Apply formatted message content */}
          <div className={`prose prose-sm max-w-none ${message.sender === 'system' ? 'text-amber-700' : ''}`}>
            <MessageContent content={message.message} sender={message.sender} />
          </div>
          
          {/* Agent Recommendations */}
          {showMetisRecommendation && (
            <div className="mt-4">
              <AgentRecommendation
                agentName="Metis"
                description="Advanced crypto risk analysis agent powered by specialized AI models."
                fee={500}
                onActivate={() => handleActivateAgent('Metis', 500, 'Advanced crypto risk analysis agent powered by specialized AI models.')}
                onDismiss={() => handleDismissRecommendation('Metis')}
              />
            </div>
          )}
          
          {showVeniceRecommendation && (
            <div className="mt-4">
              <AgentRecommendation
                agentName="Venice"
                description="AI model optimization agent for enhanced performance and efficiency in machine learning tasks."
                fee={800}
                onActivate={() => handleActivateAgent('Venice', 800, 'AI model optimization agent for enhanced performance and efficiency in machine learning tasks.')}
                onDismiss={() => handleDismissRecommendation('Venice')}
              />
            </div>
          )}
          
          {showQryptoRecommendation && (
            <div className="mt-4">
              <AgentRecommendation
                agentName="Qrypto Persona"
                description="Personalized crypto trading assistant with portfolio management and DeFi integration capabilities."
                fee={200}
                onActivate={() => handleActivateAgent('Qrypto Persona', 200, 'Personalized crypto trading assistant with portfolio management and DeFi integration capabilities.')}
                onDismiss={() => handleDismissRecommendation('Qrypto Persona')}
              />
            </div>
          )}
          
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
      
      {selectedAgent && (
        <AgentActivationModal
          isOpen={showActivationModal}
          onClose={() => {
            setShowActivationModal(false);
            setSelectedAgent(null);
          }}
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
