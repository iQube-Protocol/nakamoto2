
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MetaQube, CommunityMetrics, BlakQube } from '@/lib/types';
import { processAgentInteraction, getConversationContext } from '@/services/agent-service';
import BaseAgentPanel from '@/components/shared/agent/BaseAgentPanel';
import { useAgentPanel } from '@/hooks/agent-interface/use-agent-panel';

interface AgentPanelProps {
  communityMetrics: CommunityMetrics;
  metaQube: MetaQube;
  blakQube?: BlakQube;
  isPanelCollapsed: boolean;
}

const AgentPanel = ({ 
  communityMetrics, 
  metaQube, 
  blakQube,
  isPanelCollapsed 
}: AgentPanelProps) => {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const { 
    toast, 
    historicalContext,
    documentContextUpdated, 
    handleDocumentContextUpdated 
  } = useAgentPanel({
    agentType: 'connect',
    conversationId,
    setConversationId
  });

  const handleAIMessage = async (message: string) => {
    try {
      // Get conversation context, including history if available
      const contextResult = await getConversationContext(conversationId, 'connect');
      
      if (contextResult.conversationId !== conversationId) {
        setConversationId(contextResult.conversationId);
        console.log(`Setting new conversation ID: ${contextResult.conversationId}`);
      }
      
      const { data, error } = await supabase.functions.invoke('connect-ai', {
        body: { 
          message, 
          metaQube,
          blakQube,
          communityMetrics,
          conversationId: contextResult.conversationId,
          historicalContext: contextResult.historicalContext
        }
      });
      
      if (error) {
        console.error('Error calling connect-ai function:', error);
        throw new Error(error.message);
      }
      
      if (data.conversationId) {
        setConversationId(data.conversationId);
        console.log(`MCP conversation established with ID: ${data.conversationId}`);
        
        if (data.mcp) {
          console.log('MCP metadata:', data.mcp);
        }
      }
      
      // Store the interaction in the database for persistence
      await processAgentInteraction(
        message,
        'connect',
        data.message,
        {
          ...(data.mcp || {}),
          conversationId: data.conversationId
        }
      );
      
      return {
        id: Date.now().toString(),
        sender: 'agent' as const,
        message: data.message,
        timestamp: data.timestamp || new Date().toISOString(),
        metadata: data.mcp || null
      };
    } catch (error) {
      console.error('Failed to get AI response:', error);
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
      };
    }
  };

  return (
    <BaseAgentPanel
      title="Connection Assistant"
      description="Community insights and networking opportunities"
      agentType="connect"
      conversationId={conversationId}
      isPanelCollapsed={isPanelCollapsed}
      initialMessage="Welcome to your Connect dashboard. Based on your iQube profile, I've identified several community members with similar interests in DeFi and NFTs. Would you like me to suggest potential connections or keep you updated on upcoming events?"
      onMessageSubmit={handleAIMessage}
      onDocumentAdded={() => handleDocumentContextUpdated()}
      documentContextUpdated={documentContextUpdated}
    />
  );
};

export default AgentPanel;
