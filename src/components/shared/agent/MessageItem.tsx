
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

  // Check for Metis active status on load and listen for changes
  useEffect(() => {
    const checkMetisStatus = () => {
      const metisActiveStatus = localStorage.getItem('metisActive');
      const metisRemoved = localStorage.getItem('metisRemoved');
      
      console.log('MessageItem: Checking Metis status from localStorage:', {
        active: metisActiveStatus === 'true',
        removed: metisRemoved === 'true'
      });
      
      setMetisActive(metisActiveStatus === 'true' && metisRemoved !== 'true');
    };
    
    // Check on initial load
    checkMetisStatus();
    
    // Listen for activation events
    const handleMetisActivated = () => {
      console.log('MessageItem: Metis agent activated via event');
      setMetisActive(true);
    };
    
    const handleMetisToggled = (e: CustomEvent) => {
      const isActive = e.detail?.active;
      console.log('MessageItem: Metis toggled event received:', isActive);
      setMetisActive(isActive);
    };
    
    const handleMetisRemoved = () => {
      console.log('MessageItem: Metis removed event received');
      setMetisActive(false);
    };
    
    window.addEventListener('metisActivated', handleMetisActivated);
    window.addEventListener('metisToggled', handleMetisToggled as EventListener);
    window.addEventListener('metisRemoved', handleMetisRemoved);
    
    return () => {
      window.removeEventListener('metisActivated', handleMetisActivated);
      window.removeEventListener('metisToggled', handleMetisToggled as EventListener);
      window.removeEventListener('metisRemoved', handleMetisRemoved);
    };
  }, []);

  // Check if the message contains crypto-risk related keywords
  useEffect(() => {
    if (message.sender === 'user') {
      const lowerMessage = message.message.toLowerCase();
      const hasCryptoKeyword = 
        lowerMessage.includes('risk') && 
        (lowerMessage.includes('token') || 
         lowerMessage.includes('wallet') || 
         lowerMessage.includes('crypto') || 
         lowerMessage.includes('blockchain'));
      
      // Only show recommendation if Metis is not already active and not removed
      const metisRemoved = localStorage.getItem('metisRemoved') === 'true';
      const metisActive = localStorage.getItem('metisActive') === 'true';
      
      if (hasCryptoKeyword && !metisActive && !metisRemoved) {
        // Slight delay to ensure message is processed first
        setTimeout(() => {
          setShowRecommendation(true);
        }, 1000);
      }
    }
  }, [message]);

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
    console.log('MessageItem: Metis activation completed via modal');
    setMetisActive(true);
    toast({
      title: "Metis Agent Activated",
      description: "You now have access to advanced crypto risk analysis capabilities.",
      variant: "default",
    });
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
                  metisActive: message.metadata.metisActive || metisActive
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
