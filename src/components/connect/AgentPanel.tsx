
import React, { useState, useEffect } from 'react';
import { AgentInterface } from '@/components/shared/agent';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MetaQube, CommunityMetrics, BlakQube } from '@/lib/types';
import { processAgentInteraction, getConversationContext } from '@/services/agent-service';

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
  const { toast } = useToast();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [historicalContext, setHistoricalContext] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Load conversation context when component mounts
  useEffect(() => {
    const loadContext = async () => {
      if (!conversationId) {
        console.log('No conversationId provided, skipping context load');
        return;
      }
      
      setIsLoading(true);
      try {
        const context = await getConversationContext(conversationId, 'connect');
        if (context.historicalContext) {
          setHistoricalContext(context.historicalContext);
          console.log('Loaded historical context for connect agent');
        }
        
        if (context.conversationId !== conversationId) {
          setConversationId(context.conversationId);
        }
      } catch (error) {
        console.error('Error loading conversation context:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadContext();
  }, [conversationId]);

  const handleAIMessage = async (message: string) => {
    try {
      // Get conversation context, including history if available
      const contextResult = await getConversationContext(conversationId, 'connect');
      
      if (contextResult.conversationId !== conversationId) {
        setConversationId(contextResult.conversationId);
        console.log(`Setting new conversation ID: ${contextResult.conversationId}`);
      }
      
      if (contextResult.historicalContext !== historicalContext) {
        setHistoricalContext(contextResult.historicalContext);
        console.log('Updated historical context for connect agent');
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
          ...(data.metadata || {}),
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

  if (isLoading) {
    console.log('AgentPanel is loading conversation context...');
  }

  return (
    <div className={`${isPanelCollapsed ? 'col-span-11' : 'col-span-8'} flex flex-col`}>
      <AgentInterface
        title="Connection Assistant"
        description="Community insights and networking opportunities"
        agentType="connect"
        onMessageSubmit={handleAIMessage}
        initialMessages={[
          {
            id: "1",
            sender: "agent",
            message: "Welcome to your Connect dashboard. Based on your iQube profile, I've identified several community members with similar interests in DeFi and NFTs. Would you like me to suggest potential connections or keep you updated on upcoming events?",
            timestamp: new Date().toISOString(),
            metadata: {
              version: "1.0",
              modelUsed: "gpt-4o-mini"
            }
          }
        ]}
      />
    </div>
  );
};

export default AgentPanel;
