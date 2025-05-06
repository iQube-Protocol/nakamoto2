
import React, { useState, useEffect } from 'react';
import { AgentInterface } from '@/components/shared/agent';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MetaQube, BlakQube } from '@/lib/types';
import { processAgentInteraction, getConversationContext } from '@/services/agent-service';
import { useMCP } from '@/hooks/use-mcp';
import { toast } from 'sonner';

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
  const [historicalContext, setHistoricalContext] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { client: mcpClient, isInitialized } = useMCP();
  const [documentContextUpdated, setDocumentContextUpdated] = useState<number>(0);

  // Listen for Metis activation events
  useEffect(() => {
    // Check if Metis is already activated via localStorage
    const storedMetisActive = localStorage.getItem('metisActive');
    if (storedMetisActive === 'true') {
      setMetisActive(true);
      console.log('AgentPanel: Metis already active from localStorage');
    }

    const handleMetisActivated = () => {
      setMetisActive(true);
      console.log('AgentPanel: Metis agent activated via custom event');
    };

    window.addEventListener('metisActivated', handleMetisActivated);
    
    return () => {
      window.removeEventListener('metisActivated', handleMetisActivated);
    };
  }, []);

  // Load conversation context when component mounts or conversationId changes
  useEffect(() => {
    const loadContext = async () => {
      if (!conversationId) {
        console.log('No conversationId provided, skipping context load');
        return;
      }
      
      setIsLoading(true);
      try {
        const context = await getConversationContext(conversationId, 'learn');
        if (context.historicalContext) {
          setHistoricalContext(context.historicalContext);
          console.log('Loaded historical context for learn agent');
        }
        
        if (context.conversationId !== conversationId) {
          setConversationId(context.conversationId);
        }
        
        // Initialize MCP with this conversation ID
        if (mcpClient && isInitialized) {
          await mcpClient.initializeContext(context.conversationId);
          console.log(`MCP context initialized for conversation ${context.conversationId}`);
        }
      } catch (error) {
        console.error('Error loading conversation context:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadContext();
  }, [conversationId, setConversationId, mcpClient, isInitialized]);

  // Handle when documents are added or removed
  const handleDocumentContextUpdated = () => {
    setDocumentContextUpdated(prev => prev + 1);
    console.log('Document context updated, triggering refresh');
  };

  const handleAIMessage = async (message: string) => {
    try {
      // Get conversation context, including history if available
      const contextResult = await getConversationContext(conversationId, 'learn');
      
      if (contextResult.conversationId !== conversationId) {
        setConversationId(contextResult.conversationId);
        console.log(`Setting new conversation ID: ${contextResult.conversationId}`);
      }
      
      if (contextResult.historicalContext !== historicalContext) {
        setHistoricalContext(contextResult.historicalContext);
        console.log('Updated historical context for learn agent');
      }
      
      // Get MCP context if available
      let documentContext = [];
      if (mcpClient) {
        const mcpContext = mcpClient.getModelContext();
        if (mcpContext?.documentContext) {
          documentContext = mcpContext.documentContext;
          console.log('MCP: Including document context in request', {
            documentCount: documentContext.length,
            documentIds: documentContext.map(doc => doc.documentId),
            documentNames: documentContext.map(doc => doc.documentName)
          });
          
          // Log a sample of each document's content to verify it's being sent
          documentContext.forEach((doc, index) => {
            const contentPreview = doc.content.substring(0, 100) + (doc.content.length > 100 ? '...' : '');
            console.log(`Document ${index + 1} (${doc.documentName}) content preview:`, contentPreview);
          });
        }
      }
      
      // Call the edge function to get the AI response
      const { data, error } = await supabase.functions.invoke('learn-ai', {
        body: { 
          message, 
          metaQube,
          blakQube,
          conversationId: contextResult.conversationId,
          metisActive,
          historicalContext: contextResult.historicalContext,
          documentContext: documentContext
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
            localStorage.setItem('metisActive', 'true');
            
            // Dispatch global event to notify other components
            const activationEvent = new Event('metisActivated');
            window.dispatchEvent(activationEvent);
            
            console.log(`Metis agent status updated to: ${data.mcp.metisActive}`);
          }
        }
      }

      // Store the interaction in the database for persistence
      await processAgentInteraction(
        message,
        'learn',
        data.message,
        {
          ...(data.mcp || {}),
          metisActive: metisActive,
          conversationId: data.conversationId
        }
      );
      
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

  if (isLoading) {
    console.log('AgentPanel is loading conversation context...');
  }

  return (
    <div className={`${isPanelCollapsed ? 'lg:col-span-1' : 'lg:col-span-2'} flex flex-col`}>
      <AgentInterface
        title="Learning Assistant"
        description="Personalized web3 education based on your iQube data"
        agentType="learn"
        onMessageSubmit={handleAIMessage}
        onDocumentAdded={handleDocumentContextUpdated}
        documentContextUpdated={documentContextUpdated}
        conversationId={conversationId}
        initialMessages={[
          {
            id: "1",
            sender: "agent",
            message: "Hi there! I'm your Learning Assistant, here to help you explore the world of Web3 and blockchain. Based on your iQube profile, I see you're interested in several Web3 topics. You can now add Google Drive documents to our conversation for me to analyze. What aspects of blockchain or Web3 are you curious about today?",
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
