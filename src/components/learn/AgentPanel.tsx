
import React, { useState } from 'react';
import { AgentInterface } from '@/components/shared/agent';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MetaQube, BlakQube } from '@/lib/types';

interface AgentPanelProps {
  metaQube: MetaQube;
  blakQube?: BlakQube;
  conversationId: string | null;
  setConversationId: (id: string | null) => void;
  isPanelCollapsed: boolean;
}

const AgentPanel = ({ 
  metaQube, 
  blakQube,
  conversationId, 
  setConversationId,
  isPanelCollapsed 
}: AgentPanelProps) => {
  const { toast } = useToast();
  const [metisActive, setMetisActive] = useState<boolean>(false);

  const handleAIMessage = async (message: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('learn-ai', {
        body: { 
          message, 
          metaQube,
          blakQube,
          conversationId,
          metisActive
        }
      });
      
      if (error) {
        console.error('Error calling learn-ai function:', error);
        throw new Error(error.message);
      }
      
      if (data.conversationId) {
        setConversationId(data.conversationId);
        console.log(`MCP conversation established with ID: ${data.conversationId}`);
        
        if (data.mcp) {
          console.log('MCP metadata:', data.mcp);
          
          // Update local state if Metis was activated through the payment flow
          if (data.mcp.metisActive !== undefined && data.mcp.metisActive !== metisActive) {
            setMetisActive(data.mcp.metisActive);
            console.log(`Metis agent status updated to: ${data.mcp.metisActive}`);
          }
        }
      }
      
      // Listen for events from MessageItem to update Metis status
      window.addEventListener('metisActivated', () => {
        setMetisActive(true);
      });
      
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
    <div className={`${isPanelCollapsed ? 'lg:col-span-1' : 'lg:col-span-2'} flex flex-col`}>
      <AgentInterface
        title="Learning Assistant"
        description="Personalized web3 education based on your iQube data"
        agentType="learn"
        onMessageSubmit={handleAIMessage}
        initialMessages={[
          {
            id: "1",
            sender: "agent",
            message: "Hi there! I'm your Learning Assistant, here to help you explore the world of Web3 and blockchain. Based on your iQube profile, I see you're interested in several Web3 topics. What aspects of blockchain or Web3 are you curious about today? Or is there something specific you'd like to learn?",
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
