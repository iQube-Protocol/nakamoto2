
import React, { useEffect } from 'react';
import { AgentMessage } from '@/lib/types';
import MessageList from '../MessageList';
import EmptyConversation from '../EmptyConversation';

interface ChatTabProps {
  messages: AgentMessage[];
  playing: string | null;
  agentType: 'learn' | 'earn' | 'connect' | 'mondai';
  messagesEndRef: React.RefObject<HTMLDivElement>;
  handlePlayAudio: (messageId: string) => void;
  recommendations?: {
    showVeniceRecommendation: boolean;
    showQryptoRecommendation: boolean;
    showKNYTRecommendation: boolean;
  };
  onActivateAgent?: (agentName: string, fee: number, description: string) => void;
  onDismissRecommendation?: (agentName: string) => void;
}

const ChatTab: React.FC<ChatTabProps> = ({
  messages,
  playing,
  agentType,
  messagesEndRef,
  handlePlayAudio,
  recommendations,
  onActivateAgent,
  onDismissRecommendation
}) => {
  // Effect to scroll to the latest message whenever messages change or on initial load
  useEffect(() => {
    if (messagesEndRef.current && messages.length > 0) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, messagesEndRef]);

  // Ensure messages are sorted by timestamp (oldest first)
  const sortedMessages = [...messages].sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {messages.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <EmptyConversation agentType={agentType} />
        </div>
      ) : (
        <MessageList 
          messages={sortedMessages} 
          isProcessing={false} 
          playing={playing} 
          onPlayAudio={handlePlayAudio} 
          messagesEndRef={messagesEndRef}
          recommendations={recommendations}
          onActivateAgent={onActivateAgent}
          onDismissRecommendation={onDismissRecommendation}
        />
      )}
    </div>
  );
};

export default ChatTab;
