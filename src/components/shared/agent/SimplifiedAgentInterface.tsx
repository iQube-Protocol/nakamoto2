
import React, { useState, useEffect, useRef } from 'react';
import { AgentMessage } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import AgentHeader from './AgentHeader';
import SimplifiedAgentTabs from './tabs/SimplifiedAgentTabs';
import { useAgentMessages } from './hooks/useAgentMessages';
import './styles/agent-interface.css';

interface SimplifiedAgentInterfaceProps {
  title: string;
  description: string;
  agentType: 'learn' | 'earn' | 'connect' | 'mondai';
  conversationId?: string | null; 
  initialMessages?: AgentMessage[];
  onMessageSubmit?: (message: string) => Promise<AgentMessage>;
  onDocumentAdded?: () => void;
  documentContextUpdated?: number;
}

const SimplifiedAgentInterface = ({
  title,
  description,
  agentType,
  conversationId: externalConversationId,
  initialMessages = [],
  onMessageSubmit,
  onDocumentAdded,
  documentContextUpdated = 0,
}: SimplifiedAgentInterfaceProps) => {
  // Only chat and knowledge tabs for simplified interface
  const [activeTab, setActiveTab] = useState<'chat' | 'knowledge'>('chat');
  
  const {
    messages,
    setMessages,
    inputValue,
    isProcessing,
    playing,
    messagesEndRef,
    conversationId,
    handleInputChange,
    handleSubmit,
    handlePlayAudio,
  } = useAgentMessages({
    agentType,
    initialMessages,
    conversationId: externalConversationId,
    onMessageSubmit
  });

  return (
    <Card className="flex flex-col h-full overflow-hidden premium-card bg-gradient-to-br from-primary-purple/5 via-background to-primary-orange/5 border-primary-purple/20">
      <AgentHeader 
        title={title} 
        description={description} 
        isProcessing={isProcessing} 
      />

      <SimplifiedAgentTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        messages={messages}
        inputValue={inputValue}
        isProcessing={isProcessing}
        playing={playing}
        agentType={agentType}
        messagesEndRef={messagesEndRef}
        conversationId={conversationId}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        handlePlayAudio={handlePlayAudio}
      />
    </Card>
  );
};

export default SimplifiedAgentInterface;
