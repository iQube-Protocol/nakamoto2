
import React, { useState, useEffect } from 'react';
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

  // Listen for Metis activation events
  useEffect(() => {
    // Check if Metis is already activated via localStorage
    const storedMetisActive = localStorage.getItem('metisActive');
    const metisRemoved = localStorage.getItem('metisRemoved');
    
    // Only set active if it's not been removed
    if (storedMetisActive === 'true' && metisRemoved !== 'true') {
      setMetisActive(true);
      console.log('AgentPanel: Metis already active from localStorage');
    }

    const handleMetisActivated = () => {
      setMetisActive(true);
      console.log('AgentPanel: Metis agent activated via custom event');
    };
    
    const handleMetisToggled = (e: CustomEvent) => {
      const isActive = e.detail?.active;
      console.log('AgentPanel: Metis toggled event received:', isActive);
      setMetisActive(isActive);
    };
    
    const handleMetisRemoved = () => {
      console.log('AgentPanel: Metis removed event received');
      setMetisActive(false);
    };

    window.addEventListener('metisActivated', handleMetisActivated);
    window.addEventListener('metisToggled', handleMetisToggled as EventListener);
    window.addEventListener('metisRemoved', handleMetisRemoved);
    
    return () => {
      window.removeEventListener('metisActivated', handleMetisActivated);
      window.removeEventListener('metisToggled', handleMetisToggled as EventListener);
      window.removeEventListener('metisRemoved', handleMetisRemoved);
    };
  }, []);

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
            
            // Persist Metis activation status to localStorage
            localStorage.setItem('metisActive', data.mcp.metisActive ? 'true' : 'false');
            
            // Dispatch global event to notify other components
            if (data.mcp.metisActive) {
              const activationEvent = new CustomEvent('metisActivated');
              window.dispatchEvent(activationEvent);
            }
            
            // Also dispatch toggle event for components that listen for it
            const toggleEvent = new CustomEvent('metisToggled', { 
              detail: { active: data.mcp.metisActive } 
            });
            window.dispatchEvent(toggleEvent);
            
            console.log(`Metis agent status updated to: ${data.mcp.metisActive}`);
          }
        }
      }
      
      return {
        id: Date.now().toString(),
        sender: 'agent' as const,
        message: data.message,
        timestamp: data.timestamp || new Date().toISOString(),
        metadata: {
          ...(data.mcp || {}),
          metisActive: metisActive
        }
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
        metadata: {
          metisActive: metisActive
        }
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
              modelUsed: "gpt-4o-mini",
              metisActive: metisActive
            }
          }
        ]}
      />
    </div>
  );
};

export default AgentPanel;
