
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
  additionalActions?: React.ReactNode;
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
  additionalActions,
}: SimplifiedAgentInterfaceProps) => {
  // Get active tab from localStorage or default to 'chat'
  const getInitialTab = () => {
    if (typeof window !== 'undefined') {
      const savedTab = localStorage.getItem(`${agentType}-active-tab`);
      if (savedTab && ['chat', 'knowledge', 'media'].includes(savedTab)) {
        return savedTab as 'chat' | 'knowledge' | 'media';
      }
    }
    return 'chat';
  };
  
  const [activeTab, setActiveTab] = useState<'chat' | 'knowledge' | 'media'>(getInitialTab());
  
  // Save active tab to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(`${agentType}-active-tab`, activeTab);
  }, [activeTab, agentType]);
  
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
    handleKeyDown
  } = useAgentMessages({
    agentType,
    initialMessages,
    conversationId: externalConversationId,
    onMessageSubmit
  });

  return (
    <Card className="flex flex-col h-full overflow-hidden">
      <AgentHeader 
        title={title} 
        description={description} 
        isProcessing={isProcessing}
        additionalActions={additionalActions}
      />

      <div className="flex-1 overflow-hidden">
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
          handleKeyDown={handleKeyDown}
        />
      </div>
    </Card>
  );
};

export default SimplifiedAgentInterface;
