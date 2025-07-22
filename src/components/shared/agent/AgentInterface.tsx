
import React, { useState, useEffect } from 'react';
import { AgentMessage } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import AgentHeader from './AgentHeader';
import AgentTabs from './tabs/AgentTabs';
import { useAgentMessagesWithRecommendations } from './hooks/useAgentMessagesWithRecommendations';
import { useMetisAgent } from '@/hooks/use-metis-agent';
import { useQryptoPersona } from '@/hooks/use-qrypto-persona';
import { useVeniceAgent } from '@/hooks/use-venice-agent';
import { useKNYTPersona } from '@/hooks/use-knyt-persona';
import './styles/agent-interface.css';

interface AgentInterfaceProps {
  title: string;
  description: string;
  agentType: 'learn' | 'earn' | 'connect' | 'mondai';
  conversationId?: string | null; 
  initialMessages?: AgentMessage[];
  onMessageSubmit?: (message: string) => Promise<AgentMessage>;
  onDocumentAdded?: () => void;
  documentContextUpdated?: number;
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
  const [documentUpdates, setDocumentUpdates] = useState<number>(0);
  
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
    handleKeyDown,
    recommendations,
    dismissRecommendation
  } = useAgentMessagesWithRecommendations({
    agentType,
    initialMessages,
    conversationId: externalConversationId,
    onMessageSubmit
  });

  // Get agent activation hooks
  const { activateMetis } = useMetisAgent();
  const { activateQryptoPersona } = useQryptoPersona();
  const { activateVenice } = useVeniceAgent();
  const { activateKNYTPersona } = useKNYTPersona();

  // Handle document context updates from parent component
  useEffect(() => {
    if (documentContextUpdated > 0) {
      console.log(`Document context updated (${documentContextUpdated}), refreshing UI`);
      setDocumentUpdates(prev => prev + 1);
    }
  }, [documentContextUpdated]);

  // Listen for document context updates from anywhere in the application
  useEffect(() => {
    const handleContextUpdate = (event: Event) => {
      console.log("Document context updated event received in AgentInterface");
      setDocumentUpdates(prev => prev + 1);
    };
    
    window.addEventListener('documentContextUpdated', handleContextUpdate);
    
    return () => {
      window.removeEventListener('documentContextUpdated', handleContextUpdate);
    };
  }, []);

  const handleDocumentAdded = () => {
    // Notify the user that document context has been updated
    toast.success('Document context has been updated');
    
    // Add a system message to inform the user about documents
    const systemMessage: AgentMessage = {
      id: `system-${Date.now()}`,
      sender: 'system',
      message: 'I can now access the document you\'ve added. Feel free to ask questions about its content.',
      timestamp: new Date().toISOString(),
    };
    
    // Add the system message to the chat
    setMessages(prev => [...prev, systemMessage]);
    
    // Update document counter to trigger UI refresh
    setDocumentUpdates(prev => prev + 1);
    
    // Call the parent's onDocumentAdded if provided
    if (onDocumentAdded) {
      onDocumentAdded();
    }
    
    // Switch to chat tab after document is added
    setActiveTab('chat');
  };

  const handleActivateAgent = (agentName: string, fee: number, description: string) => {
    switch (agentName) {
      case 'Metis':
        activateMetis();
        toast.success(`${agentName} activated successfully!`, {
          description: `${description} (Fee: ${fee} Satoshi)`
        });
        break;
      case 'Venice':
        activateVenice();
        toast.success(`${agentName} activated successfully!`, {
          description: `${description} (Fee: ${fee} Satoshi)`
        });
        break;
      case 'Qrypto Persona':
        activateQryptoPersona();
        toast.success(`${agentName} activated successfully!`, {
          description: `${description} (Fee: ${fee} Satoshi)`
        });
        break;
      case 'KNYT Persona':
        activateKNYTPersona();
        toast.success(`${agentName} activated successfully!`, {
          description: `${description} ${fee === 0 ? '(Free + 2,800 Satoshi reward!)' : `(Fee: ${fee} Satoshi)`}`
        });
        break;
      default:
        toast.success(`${agentName} activated successfully!`);
    }
    
    // Hide the recommendation after activation
    dismissRecommendation(agentName);
  };

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
        documentUpdates={documentUpdates}
        handleKeyDown={handleKeyDown}
        recommendations={recommendations}
        onActivateAgent={handleActivateAgent}
        onDismissRecommendation={dismissRecommendation}
      />
    </Card>
  );
};

export default AgentInterface;
