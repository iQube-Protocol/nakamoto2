
import React from 'react';
import { MetaQube, BlakQube } from '@/lib/types';
import { getConversationContext } from '@/services/agent-service';
import { useMetisActivation } from '@/hooks/use-metis-activation';
import { sendMessageToLearnAI } from '@/services/learn-ai-service';
import BaseAgentPanel from '@/components/shared/agent/BaseAgentPanel';
import { useAgentPanel } from '@/hooks/agent-interface/use-agent-panel';

interface AgentPanelProps {
  metaQube: MetaQube;
  blakQube?: BlakQube;
  conversationId: string | null;
  setConversationId: (id: string | null) => void;
  isPanelCollapsed: boolean;
  onDocumentAdded?: () => void;
}

const AgentPanel = ({ 
  metaQube, 
  blakQube,
  conversationId, 
  setConversationId,
  isPanelCollapsed,
  onDocumentAdded 
}: AgentPanelProps) => {
  const { metisActive, updateMetisStatus } = useMetisActivation();
  const { 
    toast, 
    mcpClient, 
    documentContextUpdated, 
    handleDocumentContextUpdated 
  } = useAgentPanel({
    agentType: 'learn',
    conversationId,
    setConversationId
  });

  // Handle when documents are added or removed
  const handleDocumentContextChange = () => {
    handleDocumentContextUpdated(onDocumentAdded);
  };

  const handleAIMessage = async (message: string) => {
    try {
      // Get conversation context, including history if available
      const contextResult = await getConversationContext(conversationId, 'learn');
      
      if (contextResult.conversationId !== conversationId) {
        setConversationId(contextResult.conversationId);
        console.log(`Setting new conversation ID: ${contextResult.conversationId}`);
      }
      
      // Get AI response
      const response = await sendMessageToLearnAI(
        message, 
        contextResult, 
        metaQube, 
        blakQube, 
        mcpClient, 
        metisActive
      );
      
      // Update Metis activation status if changed in the response
      if (response.metadata?.metisActive !== undefined && response.metadata.metisActive !== metisActive) {
        updateMetisStatus(response.metadata.metisActive);
      }
      
      // Update conversation ID if changed
      if (response.metadata?.conversationId && response.metadata.conversationId !== conversationId) {
        setConversationId(response.metadata.conversationId);
      }
      
      return response;
    } catch (error) {
      console.error('Failed to process AI message:', error);
      toast({
        title: "AI Service Error",
        description: "Could not connect to the AI service. Please try again later.",
        variant: "destructive"
      });
      
      return {
        id: Date.now().toString(),
        sender: 'agent' as const,
        message: "I'm sorry, I couldn't process your request. Please try again later.",
        timestamp: new Date().toISOString(),
        metadata: {
          metisActive: metisActive
        }
      };
    }
  };

  return (
    <BaseAgentPanel
      title="Learning Assistant"
      description="Personalized web3 education based on your iQube data"
      agentType="learn"
      conversationId={conversationId}
      isPanelCollapsed={isPanelCollapsed}
      initialMessage="Hi there! I'm your Learning Assistant, here to help you explore the world of Web3 and blockchain. Based on your iQube profile, I see you're interested in several Web3 topics. You can now add Google Drive documents to our conversation for me to analyze. What aspects of blockchain or Web3 are you curious about today?"
      onMessageSubmit={handleAIMessage}
      onDocumentAdded={handleDocumentContextChange}
      documentContextUpdated={documentContextUpdated}
    />
  );
};

export default AgentPanel;
