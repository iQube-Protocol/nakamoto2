
import React, { useState, useEffect } from 'react';
import { AgentMessage } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import AgentHeader from './AgentHeader';
import AgentTabs from './tabs/AgentTabs';
import { useAgentMessages } from './hooks/useAgentMessages';

interface AgentInterfaceProps {
  title: string;
  description: string;
  agentType: 'learn' | 'earn' | 'connect';
  conversationId?: string | null; 
  initialMessages?: AgentMessage[];
  onMessageSubmit?: (message: string) => Promise<AgentMessage>;
  onDocumentAdded?: () => void;
  documentContextUpdated?: number; // Counter to track document context updates
}

const AgentInterface = ({
  title,
  description,
  agentType,
  conversationId: externalConversationId,
  initialMessages = [],
  onMessageSubmit,
  onDocumentAdded,
  documentContextUpdated = 0,
}: AgentInterfaceProps) => {
  // Get the active tab from localStorage or default to 'chat'
  const getInitialTab = () => {
    if (typeof window !== 'undefined') {
      const savedTab = localStorage.getItem(`${agentType}-active-tab`);
      if (savedTab && ['chat', 'knowledge', 'documents'].includes(savedTab)) {
        return savedTab as 'chat' | 'knowledge' | 'documents';
      }
    }
    return 'chat';
  };
  
  const [activeTab, setActiveTab] = useState<'chat' | 'knowledge' | 'documents'>(getInitialTab());
  
  // Save active tab to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(`${agentType}-active-tab`, activeTab);
  }, [activeTab, agentType]);
  
  const {
    messages,
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

  const handleDocumentAdded = () => {
    // Notify the user that document context has been updated
    toast.success('Document context has been updated');
    
    // Call the parent's onDocumentAdded if provided
    if (onDocumentAdded) {
      onDocumentAdded();
    }
    
    // Keep the user on the documents tab to see the updated list
    // Do not switch to chat tab automatically
  };

  // Effect to track document context updates
  useEffect(() => {
    if (documentContextUpdated > 0) {
      console.log(`Document context updated (${documentContextUpdated}), refreshing UI`);
    }
  }, [documentContextUpdated]);

  return (
    <Card className="flex flex-col h-full overflow-hidden">
      <AgentHeader 
        title={title} 
        description={description} 
        isProcessing={isProcessing} 
      />

      <AgentTabs
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
        handleDocumentAdded={handleDocumentAdded}
      />
    </Card>
  );
};

export default AgentInterface;
