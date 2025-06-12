
import React, { useEffect } from 'react';
import { AgentInterface } from '@/components/shared/agent';
import { useMondAI } from '@/hooks/use-mondai';
import MonDAIHeader from './MonDAIHeader';
import { useKBAIConnection } from '@/hooks/mondai/useKBAIConnection';
import { sonnerToast as toast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

const MonDAIInterface: React.FC = () => {
  const isMobile = useIsMobile();
  
  // Use our custom hook for MonDAI functionality
  const {
    conversationId,
    documentUpdates,
    handleAIMessage,
    handleDocumentContextUpdated,
  } = useMondAI();

  // Use the KBAI connection hook
  const {
    serverConfig,
    isRetrying,
    connectionStatus,
    fetchKnowledgeItems,
    getStatusDescription,
    handleConfigUpdate,
    handleManualRetry
  } = useKBAIConnection();

  // Set fullscreen mode effect for mobile only
  useEffect(() => {
    if (isMobile) {
      // Add a class to the root element for fullscreen styling on mobile
      document.documentElement.classList.add('fullscreen-mode');
    }
    
    // Remove the class when component unmounts or when not mobile
    return () => {
      document.documentElement.classList.remove('fullscreen-mode');
    };
  }, [isMobile]);
  
  // Check KBAI connection on initial load and auto-retry with exponential backoff
  useEffect(() => {
    console.log("MonDAI: Initializing connection to knowledge base");
    const maxRetries = 3;
    const checkConnection = async (retryCount = 0) => {
      try {
        console.log(`MonDAI: Attempt ${retryCount + 1} to connect to knowledge base...`);
        // First attempt to load knowledge items
        await fetchKnowledgeItems();
        
        console.log(`MonDAI: Connection status after fetch: ${connectionStatus}`);
        
        if (connectionStatus === 'error' && retryCount < maxRetries) {
          const delay = Math.min(2000 * Math.pow(2, retryCount), 10000); // exponential backoff
          console.log(`Connection failed, retrying in ${delay/1000}s (attempt ${retryCount + 1}/${maxRetries})...`);
          
          setTimeout(async () => {
            console.log(`MonDAI: Starting retry attempt ${retryCount + 1}...`);
            await handleManualRetry();
          }, delay);
        } else if (connectionStatus === 'connected') {
          console.log('MonDAI: Successfully connected to KBAI service!');
        }
      } catch (error) {
        console.error('Error in initial connection check:', error);
        if (retryCount < maxRetries) {
          setTimeout(() => checkConnection(retryCount + 1), 2000);
        }
      }
    };
    
    checkConnection();
  }, []);

  // Initial welcome message with instructions about mermaid diagrams and visuals
  const initialMessage = connectionStatus === 'connected'
    ? "Hello! I'm your MonDAI assistant with direct KBAI integration. I can help you learn about Web3, cryptocurrency, blockchain concepts, and more using my integrated knowledge base. I'll provide concise, easy-to-understand explanations, and can create visual diagrams when helpful. What would you like to know about today?"
    : "Hello! I'm your MonDAI assistant. I'm currently using an offline knowledge base for Web3 concepts. I'll provide clear, concise explanations and can create visual diagrams for complex topics. What would you like to explore today?";

  return (
    <div className="container py-6 max-w-7xl mx-auto h-full agent-interface">
      <div className="grid gap-6 h-full">
        <div className="flex flex-col h-full">
          <MonDAIHeader
            isRetrying={isRetrying}
            connectionStatus={connectionStatus}
            serverConfig={serverConfig}
            onConfigUpdate={handleConfigUpdate}
            onRetryConnection={handleManualRetry}
          />
          
          <AgentInterface
            title="MonDAI"
            description={getStatusDescription()}
            agentType="mondai" 
            onMessageSubmit={handleAIMessage}
            onDocumentAdded={handleDocumentContextUpdated}
            documentContextUpdated={documentUpdates}
            conversationId={conversationId}
            initialMessages={[
              {
                id: "1",
                sender: "agent",
                message: initialMessage,
                timestamp: new Date().toISOString(),
                metadata: {
                  version: "1.0",
                  modelUsed: "gpt-4o",
                  knowledgeSource: connectionStatus === 'connected' ? "KBAI MCP Direct" : "Offline Knowledge Base"
                }
              }
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default MonDAIInterface;
