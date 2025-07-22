
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
  // Check if we have any active recommendations
  const hasActiveRecommendations = recommendations && (
    recommendations.showMetisRecommendation ||
    recommendations.showVeniceRecommendation ||
    recommendations.showQryptoRecommendation ||
    recommendations.showKNYTRecommendation
  );

  return (
    <div className="flex-1 h-full overflow-hidden">
      <ScrollArea className="h-full">
        <div className="p-4 pb-2 space-y-4">
          {messages.map((msg, index) => (
            <MessageItem 
              key={msg.id} 
              message={msg} 
              isPlaying={playing === msg.id}
              onPlayAudio={onPlayAudio}
            />
          ))}
          
          {/* Show recommendations as a persistent element after all messages */}
          {hasActiveRecommendations && recommendations && onActivateAgent && onDismissRecommendation && (
            <div className="mt-4 pt-4 border-t border-border/50">
              <div className="text-sm text-muted-foreground mb-3 font-medium">
                💡 Recommended Agents
              </div>
              <div className="flex flex-wrap gap-3">
                {recommendations.showKNYTRecommendation && (
                  <div className="agent-recommendation">
                    <AgentRecommendation
                      agentName="KNYT Persona"
                      description="KNYT ecosystem profile with 2,800 Satoshi reward for completing LinkedIn, MetaMask, and data requirements."
                      fee={0}
                      onActivate={() => onActivateAgent('KNYT Persona', 0, 'KNYT ecosystem profile with 2,800 Satoshi reward for completing LinkedIn, MetaMask, and data requirements.')}
                      onDismiss={() => onDismissRecommendation('KNYT Persona')}
                    />
                  </div>
                )}
                
                {recommendations.showVeniceRecommendation && (
                  <div className="agent-recommendation">
                    <AgentRecommendation
                      agentName="Venice"
                      description="AI model service that protects privacy and prevents censorship for secure and unrestricted AI interactions."
                      fee={800}
                      onActivate={() => onActivateAgent('Venice', 800, 'AI model service that protects privacy and prevents censorship for secure and unrestricted AI interactions.')}
                      onDismiss={() => onDismissRecommendation('Venice')}
                    />
                  </div>
                )}
                
                {recommendations.showQryptoRecommendation && (
                  <div className="agent-recommendation">
                    <AgentRecommendation
                      agentName="Qrypto Persona"
                      description="Profile information about the user that enables personalized responses and customized AI interactions."
                      fee={200}
                      onActivate={() => onActivateAgent('Qrypto Persona', 200, 'Profile information about the user that enables personalized responses and customized AI interactions.')}
                      onDismiss={() => onDismissRecommendation('Qrypto Persona')}
                    />
                  </div>
                )}

                {recommendations.showMetisRecommendation && (
                  <div className="agent-recommendation">
                    <AgentRecommendation
                      agentName="Metis"
                      description="An algorithm that evaluates risks associated with wallets and tokens for enhanced security analysis."
                      fee={500}
                      onActivate={() => onActivateAgent('Metis', 500, 'An algorithm that evaluates risks associated with wallets and tokens for enhanced security analysis.')}
                      onDismiss={() => onDismissRecommendation('Metis')}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
          
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

// Import the AgentRecommendation component
import AgentRecommendation from './AgentRecommendation';

export default MessageList;
