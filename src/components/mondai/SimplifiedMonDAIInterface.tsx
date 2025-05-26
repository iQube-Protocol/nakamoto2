
import React, { useEffect } from 'react';
import SimplifiedAgentInterface from '@/components/shared/agent/SimplifiedAgentInterface';
import { useMondAI } from '@/hooks/use-mondai';
import { useIsMobile } from '@/hooks/use-mobile';

const SimplifiedMonDAIInterface: React.FC = () => {
  const isMobile = useIsMobile();
  
  // Use our custom hook for MonDAI functionality (simplified version)
  const {
    conversationId,
    documentUpdates,
    handleAIMessage,
    handleDocumentContextUpdated,
  } = useMondAI();

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

  // Simplified welcome message for offline mode
  const initialMessage = "Hello! I'm your MonDAI assistant. I'm ready to help you learn about Web3, cryptocurrency, blockchain concepts, and more using my integrated knowledge base. I'll provide clear, concise explanations and can create visual diagrams for complex topics. What would you like to explore today?";

  return (
    <div className="container py-6 max-w-7xl mx-auto h-full agent-interface">
      <div className="grid gap-6 h-full">
        <div className="flex flex-col h-full">          
          <SimplifiedAgentInterface
            title="MonDAI"
            description="Your intelligent Web3 learning companion"
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
                  knowledgeSource: "Offline Knowledge Base"
                }
              }
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default SimplifiedMonDAIInterface;
