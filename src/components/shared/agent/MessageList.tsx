
import React, { useState, useEffect } from 'react';
import { AgentMessage } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import MessageItem from './MessageItem';
import { useVeniceAgent } from '@/hooks/use-venice-agent';
import { useQryptoPersona } from '@/hooks/use-qrypto-persona';
import { useKNYTPersona } from '@/hooks/use-knyt-persona';

interface RecommendationState {
  showVeniceRecommendation: boolean;
  showQryptoRecommendation: boolean;
  showKNYTRecommendation: boolean;
  triggeredByMessageId?: string;
}

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
  const { veniceActivated } = useVeniceAgent();
  const { qryptoPersonaActivated } = useQryptoPersona();
  const { knytPersonaActivated } = useKNYTPersona();

  const [recommendations, setRecommendations] = useState<RecommendationState>({
    showVeniceRecommendation: false,
    showQryptoRecommendation: false,
    showKNYTRecommendation: false,
  });

  // Trigger words for each agent (matching useAgentRecommendations.ts)
  const triggerWords = {
    venice: ['privacy', 'censorship'],
    qrypto: ['personalize', 'personalise', 'customize', 'custom'],
    knyt: ['metaknyts', 'metaiye', 'knowone', 'kn0w1', 'deji', 'fang', 'bat', 'digiterra', 'metaterm', 'terra', 'qryptopia', 'knyt']
  };

  // Check for trigger words in user messages
  useEffect(() => {
    if (messages.length === 0) return;

    const lastMessage = messages[messages.length - 1];
    if (lastMessage.sender !== 'user') return;

    const messageText = lastMessage.message.toLowerCase();
    
    // Check for Venice triggers
    if (!veniceActivated && triggerWords.venice.some(word => messageText.includes(word))) {
      setTimeout(() => {
        setRecommendations(prev => ({
          ...prev,
          showVeniceRecommendation: true,
          triggeredByMessageId: lastMessage.id
        }));
      }, 1000);
    }

    // Check for Qrypto triggers
    if (!qryptoPersonaActivated && triggerWords.qrypto.some(word => messageText.includes(word))) {
      setTimeout(() => {
        setRecommendations(prev => ({
          ...prev,
          showQryptoRecommendation: true,
          triggeredByMessageId: lastMessage.id
        }));
      }, 1000);
    }

    // Check for KNYT triggers
    if (!knytPersonaActivated && triggerWords.knyt.some(word => messageText.includes(word))) {
      setTimeout(() => {
        setRecommendations(prev => ({
          ...prev,
          showKNYTRecommendation: true,
          triggeredByMessageId: lastMessage.id
        }));
      }, 1000);
    }
  }, [messages, veniceActivated, qryptoPersonaActivated, knytPersonaActivated]);

  const dismissRecommendation = (agentName: string) => {
    setRecommendations(prev => ({
      ...prev,
      showVeniceRecommendation: agentName === 'Venice' ? false : prev.showVeniceRecommendation,
      showQryptoRecommendation: agentName === 'Qrypto Persona' ? false : prev.showQryptoRecommendation,
      showKNYTRecommendation: agentName === 'KNYT Persona' ? false : prev.showKNYTRecommendation,
    }));
  };

  return (
    <div className="flex-1 h-full overflow-hidden">
      <ScrollArea className="h-full">
        <div className="p-4 pb-2 space-y-4">
          {messages.map((msg, index) => {
            // Show recommendations on agent messages that come after trigger
            const showRecommendationsOnThis = msg.sender !== 'user' && 
                                            msg.sender !== 'system' && 
                                            index > 0 && 
                                            messages[index - 1].sender === 'user';
            
            return (
              <MessageItem 
                key={msg.id} 
                message={msg} 
                isPlaying={playing === msg.id}
                onPlayAudio={onPlayAudio}
                recommendations={showRecommendationsOnThis ? recommendations : undefined}
                onDismissRecommendation={dismissRecommendation}
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
