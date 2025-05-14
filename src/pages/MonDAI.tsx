
import React, { useEffect } from 'react';
import { AgentInterface } from '@/components/shared/agent';
import { useKnowledgeBase } from '@/hooks/mcp/useKnowledgeBase';
import { useMondAI } from '@/hooks/use-mondai';
import { toast } from 'sonner';

// Extend the agent service to support 'mondai' type
declare module '@/services/agent-service' {
  interface ConversationContextOptions {
    agentType: "learn" | "earn" | "connect" | "mondai";
  }
}

const MonDAI = () => {
  // Use our custom hook
  const {
    conversationId,
    isLoading,
    documentUpdates,
    handleAIMessage,
    handleDocumentContextUpdated,
  } = useMondAI();
  
  // Initialize knowledge base
  const { 
    items: knowledgeItems,
    fetchKnowledgeItems,
    retryConnection,
    connectionStatus
  } = useKnowledgeBase();

  // Set fullscreen mode effect for mobile
  useEffect(() => {
    // Add a class to the root element for fullscreen styling
    document.documentElement.classList.add('fullscreen-mode');
    
    // Remove the class when component unmounts
    return () => {
      document.documentElement.classList.remove('fullscreen-mode');
    };
  }, []);
  
  // Check KBAI connection on initial load and auto-retry with exponential backoff
  useEffect(() => {
    const maxRetries = 3;
    const checkConnection = async (retryCount = 0) => {
      try {
        // First attempt to load knowledge items
        await fetchKnowledgeItems();
        
        if (connectionStatus === 'error' && retryCount < maxRetries) {
          const delay = Math.min(2000 * Math.pow(2, retryCount), 10000); // exponential backoff
          console.log(`Connection failed, retrying in ${delay/1000}s (attempt ${retryCount + 1}/${maxRetries})...`);
          
          setTimeout(async () => {
            const success = await retryConnection();
            if (!success && retryCount + 1 < maxRetries) {
              checkConnection(retryCount + 1);
            } else if (!success) {
              console.log('All retry attempts failed, using fallback data');
              toast.info('Using offline knowledge base', {
                description: 'Connection to knowledge base unavailable. Using local data.',
                duration: 5000,
              });
            }
          }, delay);
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

  return (
    <div className="container py-6 max-w-7xl mx-auto h-full agent-interface">
      <div className="grid gap-6 h-full">
        <div className="flex flex-col h-full">
          <AgentInterface
            title="MonDAI"
            description={connectionStatus === 'connected' 
              ? "Community agent with KBAI integration" 
              : "Community agent with offline knowledge base"}
            agentType="learn" // Using learn type for compatibility
            onMessageSubmit={handleAIMessage}
            onDocumentAdded={handleDocumentContextUpdated}
            documentContextUpdated={documentUpdates}
            conversationId={conversationId}
            initialMessages={[
              {
                id: "1",
                sender: "agent",
                message: connectionStatus === 'connected'
                  ? "Hello! I'm your MonDAI assistant with direct KBAI integration. I can help you learn about Web3, cryptocurrency, blockchain concepts, and more using my integrated knowledge base. What would you like to know about today?"
                  : "Hello! I'm your MonDAI assistant. I'm currently using an offline knowledge base for Web3 concepts. You can still ask me about blockchain, cryptocurrency, and other topics. What would you like to explore today?",
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

export default MonDAI;
