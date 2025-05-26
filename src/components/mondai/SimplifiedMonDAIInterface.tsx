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

  // Welcome message for Aigent Nakamoto with Qrypto COYN knowledge base
  const initialMessage = "Hello! I'm Aigent Nakamoto, your intelligent companion for the Qrypto COYN ecosystem. I have specialized knowledge about iQubes, the $QOYN token economy, Techno Capital Machine (TCM), Proof of Risk/Price/State consensus frameworks, and the broader crypto-agentic landscape. I can explain complex concepts with clear diagrams, provide accurate information with proper citations, and guide you through the innovative world of data-as-an-asset. What aspect of the Qrypto COYN ecosystem would you like to explore?";

  return (
    <div className="container py-6 max-w-7xl mx-auto h-full agent-interface">
      <div className="grid gap-6 h-full">
        <div className="flex flex-col h-full">          
          <SimplifiedAgentInterface
            title="Aigent Nakamoto"
            description="Your intelligent companion for the Qrypto COYN ecosystem"
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
                  modelUsed: "gpt-4o-mini",
                  knowledgeSource: "Qrypto COYN Knowledge Base",
                  qryptoItemsFound: 0,
                  citations: []
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
