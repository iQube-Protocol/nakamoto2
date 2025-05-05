
import React from 'react';
import { AgentMessage } from '@/lib/types';
import { Card } from '@/components/ui/card';
import AgentHeader from './AgentHeader';
import AgentTabsSection from './AgentTabsSection';
import { useAgentInterface } from '@/hooks/use-agent-interface';

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
  // Extract the interface state and handlers to a custom hook
  const {
    messages,
    inputValue,
    isProcessing,
    activeTab,
    playing,
    messagesEndRef,
    conversationId,
    handleInputChange,
    handleSubmit,
    handlePlayAudio,
    handleDocumentAdded,
    setActiveTab
  } = useAgentInterface({
    agentType,
    initialMessages,
    conversationId: externalConversationId || null,
    setConversationId: (id) => {
      // This is just a pass-through as the actual state is managed in the parent component
      if (externalConversationId !== id) {
        console.log(`Conversation ID updated: ${id}`);
      }
    },
    onMessageSubmit,
    onDocumentAdded
  });

  // Effect to track document context updates
  React.useEffect(() => {
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

      <AgentTabsSection
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        messages={messages}
        isProcessing={isProcessing}
        playing={playing}
        messagesEndRef={messagesEndRef}
        onPlayAudio={handlePlayAudio}
        conversationId={conversationId}
        onDocumentAdded={handleDocumentAdded}
        inputValue={inputValue}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        agentType={agentType}
      />
    </Card>
  );
};

export default AgentInterface;
