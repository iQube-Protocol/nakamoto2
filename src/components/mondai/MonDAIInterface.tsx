
import React, { useEffect } from 'react';
import { AgentInterface } from '@/components/shared/agent';
import { useMondAI } from '@/hooks/use-mondai';
import { useIsMobile } from '@/hooks/use-mobile';
import { MonDAIKnowledgeRouter } from '@/services/mondai-knowledge-router';

const MonDAIInterface: React.FC = () => {
  const isMobile = useIsMobile();
  
  // Use our custom hook for MonDAI functionality
  const {
    conversationId,
    documentUpdates,
    handleAIMessage,
    handleDocumentContextUpdated,
  } = useMondAI();

  // Get knowledge base statistics for display
  const knowledgeRouter = MonDAIKnowledgeRouter.getInstance();
  const knowledgeStats = knowledgeRouter.getKnowledgeStats();

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

  // Initial welcome message
  const initialMessage = `Hello! I'm Aigent Nakamoto, your crypto-agentic AI assistant with access to multiple knowledge bases:

• **iQubes Knowledge Base** (${knowledgeStats.knowledgeBases.find(kb => kb.name === 'iQubes')?.totalItems || 0} items)
• **COYN Knowledge Base** (${knowledgeStats.knowledgeBases.find(kb => kb.name === 'COYN')?.totalItems || 0} items)  
• **metaKnyts Knowledge Base** (${knowledgeStats.knowledgeBases.find(kb => kb.name === 'metaKnyts')?.totalItems || 0} items)

I can help you with technical concepts, narrative elements, and provide insights from both technical and storytelling perspectives. I'll route your questions to the most relevant knowledge base automatically.

What would you like to explore today?`;

  return (
    <div className="container py-6 max-w-7xl mx-auto h-full agent-interface">
      <div className="grid gap-6 h-full">
        <div className="flex flex-col h-full">          
          <AgentInterface
            title="Aigent Nakamoto"
            description="Crypto-Agentic AI with Smart Knowledge Base Routing"
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
                  knowledgeSource: "Smart Multi-KB Routing (iQubes + COYN + metaKnyts)",
                  totalKnowledgeItems: knowledgeStats.totalItems
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
