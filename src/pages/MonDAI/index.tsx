
import React from 'react';
import { AgentInterface } from '@/components/shared/agent';
import { useMonDAIConversation } from './hooks/useMonDAIConversation';
import { useKnowledgeBaseStatus } from './hooks/useKnowledgeBaseStatus';
import ConnectionStatusAlert from './components/ConnectionStatusAlert';
import DeploymentHelpDialog from './components/DeploymentHelpDialog';

// Extend the agent service to support 'mondai' type
declare module '@/services/agent-service' {
  interface ConversationContextOptions {
    agentType: "learn" | "earn" | "connect" | "mondai";
  }
}

const MonDAI = () => {
  // Use our custom hooks
  const {
    conversationId,
    handleAIMessage
  } = useMonDAIConversation();
  
  const {
    documentUpdates,
    showDeploymentHelp,
    setShowDeploymentHelp,
    connectionStatus,
    errorMessage,
    handleDocumentContextUpdated,
    handleManualReconnect,
    handleShowDeploymentHelp
  } = useKnowledgeBaseStatus();

  // Set fullscreen mode effect for mobile
  React.useEffect(() => {
    // Add a class to the root element for fullscreen styling
    document.documentElement.classList.add('fullscreen-mode');
    
    // Remove the class when component unmounts
    return () => {
      document.documentElement.classList.remove('fullscreen-mode');
    };
  }, []);

  return (
    <div className="container py-6 max-w-7xl mx-auto h-full agent-interface">
      <div className="grid gap-6 h-full">
        <div className="flex flex-col h-full">
          <ConnectionStatusAlert 
            connectionStatus={connectionStatus} 
            errorMessage={errorMessage}
            onReconnect={handleManualReconnect}
            onShowHelp={handleShowDeploymentHelp}
          />
          
          <AgentInterface
            title="MonDAI"
            description="Community agent with KBAI integration"
            agentType="learn" // Using learn type for compatibility
            onMessageSubmit={handleAIMessage}
            onDocumentAdded={handleDocumentContextUpdated}
            documentContextUpdated={documentUpdates}
            conversationId={conversationId}
            initialMessages={[
              {
                id: "1",
                sender: "agent",
                message: "Hello! I'm your MonDAI assistant with KBAI integration. I can help you learn about Web3, cryptocurrency, blockchain concepts, and more using my integrated knowledge base. What would you like to know about today?",
                timestamp: new Date().toISOString(),
                metadata: {
                  version: "1.0",
                  modelUsed: "gpt-4o",
                  knowledgeSource: "KBAI MCP"
                }
              }
            ]}
          />
        </div>
      </div>
      
      <DeploymentHelpDialog 
        open={showDeploymentHelp} 
        onOpenChange={setShowDeploymentHelp}
      />
    </div>
  );
};

export default MonDAI;
