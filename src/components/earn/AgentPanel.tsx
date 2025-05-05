
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MetaQube, TokenMetrics, BlakQube } from '@/lib/types';
import { processAgentInteraction, getConversationContext } from '@/services/agent-service';
import BaseAgentPanel from '@/components/shared/agent/BaseAgentPanel';
import { useAgentPanel } from '@/hooks/agent-interface/use-agent-panel';

interface AgentPanelProps {
  tokenMetrics: TokenMetrics;
  metaQube: MetaQube;
  blakQube?: BlakQube;
  isPanelCollapsed: boolean;
}

const AgentPanel = ({ 
  tokenMetrics, 
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
    agentType: 'earn',
    conversationId,
    setConversationId
  });

  const handleAIMessage = async (message: string) => {
    try {
      // Get conversation context, including history if available
      const contextResult = await getConversationContext(conversationId, 'earn');
      
      if (contextResult.conversationId !== conversationId) {
        setConversationId(contextResult.conversationId);
        console.log(`Setting new conversation ID: ${contextResult.conversationId}`);
      }
      
      const { data, error } = await supabase.functions.invoke('earn-ai', {
        body: { 
          message, 
          metaQube,
          blakQube,
          tokenMetrics,
          conversationId: contextResult.conversationId,
          historicalContext: contextResult.historicalContext
        }
      });
      
      if (error) {
        console.error('Error calling earn-ai function:', error);
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
        'earn',
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
      title="Earning Assistant"
      description="MonDAI token insights and earning opportunities"
      agentType="earn"
      conversationId={conversationId}
      isPanelCollapsed={isPanelCollapsed}
      initialMessage="Welcome to your Earn dashboard. I see MonDAI token has grown by 3.5% this week! Based on your iQube data, I can suggest personalized earning strategies. Would you like to explore staking options or learn about upcoming airdrops?"
      onMessageSubmit={handleAIMessage}
      onDocumentAdded={() => handleDocumentContextUpdated()}
      documentContextUpdated={documentContextUpdated}
    />
  );
};

export default AgentPanel;
