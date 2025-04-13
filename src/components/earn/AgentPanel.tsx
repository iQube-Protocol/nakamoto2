
import React from 'react';
import { AgentInterface } from '@/components/shared/agent';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MetaQube, TokenMetrics, BlakQube } from '@/lib/types';

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
  const { toast } = useToast();
  const [conversationId, setConversationId] = React.useState<string | null>(null);

  const handleAIMessage = async (message: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('earn-ai', {
        body: { 
          message, 
          metaQube,
          blakQube,
          tokenMetrics,
          conversationId 
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
    <div className={`${isPanelCollapsed ? 'col-span-11' : 'col-span-8'} flex flex-col`}>
      <AgentInterface
        title="Earning Assistant"
        description="MonDAI token insights and earning opportunities"
        agentType="earn"
        onMessageSubmit={handleAIMessage}
        initialMessages={[
          {
            id: "1",
            sender: "agent",
            message: "Welcome to your Earn dashboard. I see MonDAI token has grown by 3.5% this week! Based on your iQube data, I can suggest personalized earning strategies. Would you like to explore staking options or learn about upcoming airdrops?",
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
