
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
  const [showRecommendation, setShowRecommendation] = useState(false);
  const [showActivationModal, setShowActivationModal] = useState(false);
  const [metisActive, setMetisActive] = useState(false);

  // Check if Metis is active or has been removed
  useEffect(() => {
    const storedMetisActive = localStorage.getItem('metisActive') === 'true';
    const metisRemoved = localStorage.getItem('metisRemoved') === 'true';
    
    setMetisActive(storedMetisActive);
    
    // Listen for activation/deactivation events
    const handleMetisActivated = () => {
      console.log('MessageItem: Metis agent activation detected');
      setMetisActive(true);
    };
    
    const handleMetisDeactivated = () => {
      console.log('MessageItem: Metis agent deactivation detected');
      setMetisActive(false);
    };
    
    window.addEventListener('metisActivated', handleMetisActivated);
    window.addEventListener('metisDeactivated', handleMetisDeactivated);
    
    return () => {
      window.removeEventListener('metisActivated', handleMetisActivated);
      window.removeEventListener('metisDeactivated', handleMetisDeactivated);
    };
  }, []);

  // Check if the message contains crypto-risk related keywords
  useEffect(() => {
    const metisRemoved = localStorage.getItem('metisRemoved') === 'true';
    
    if (message.sender === 'user' && !metisActive && !metisRemoved) {
      const lowerMessage = message.message.toLowerCase();
      const hasCryptoKeyword = 
        lowerMessage.includes('risk') && 
        (lowerMessage.includes('token') || 
         lowerMessage.includes('wallet') || 
         lowerMessage.includes('crypto') || 
         lowerMessage.includes('blockchain'));
      
      if (hasCryptoKeyword) {
        // Slight delay to ensure message is processed first
        setTimeout(() => {
          setShowRecommendation(true);
        }, 1000);
      }
    }
  }, [message, metisActive]);

  const handleActivateAgent = () => {
    setShowRecommendation(false);
    setShowActivationModal(true);
  };

  const handleDismissRecommendation = () => {
    setShowRecommendation(false);
    toast({
      title: "Recommendation dismissed",
      description: "You can always activate Metis agent later by asking about crypto risks again.",
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
    setMetisActive(true);
    localStorage.setItem('metisActive', 'true');
    
    toast({
      title: "Metis Agent Activated",
      description: "You now have access to advanced crypto risk analysis capabilities.",
      variant: "default",
    });
    
    // Dispatch custom event to inform parent components about Metis activation
    const activationEvent = new Event('metisActivated');
    window.dispatchEvent(activationEvent);
    console.log('Metis activated by payment');
  };

  return (
    <div className={message.sender === 'user' ? 'user-message' : 'agent-message'}>
      <div className="flex">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            {message.sender === 'agent' && (
              <MetadataBadge 
                metadata={message.metadata ? { 
                  ...message.metadata,
                  metisActive: metisActive
                } : { metisActive: metisActive }} 
              />
            )}
          </div>
          
          {/* Apply formatted message content */}
          <div className="prose prose-sm max-w-none">
            <MessageContent content={message.message} sender={message.sender} />
          </div>
          
          {showRecommendation && (
            <AgentRecommendation
              agentName="Metis"
              description="Advanced crypto risk analysis agent powered by specialized AI models."
              fee={5}
              onActivate={handleActivateAgent}
              onDismiss={handleDismissRecommendation}
            />
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
      
      <AgentActivationModal
        isOpen={showActivationModal}
        onClose={() => setShowActivationModal(false)}
        agentName="Metis"
        fee={5}
        onConfirmPayment={handleConfirmPayment}
        onComplete={handleActivationComplete}
      />
    </div>
  );
};

export default MessageItem;
