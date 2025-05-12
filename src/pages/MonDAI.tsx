import React from 'react';
import { AgentInterface } from '@/components/shared/agent';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { processAgentInteraction, getConversationContext } from '@/services/agent-service';
import { getKBAIService } from '@/integrations/kbai/KBAIMCPService';
import { useKnowledgeBase } from '@/hooks/mcp/useKnowledgeBase';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

// Extend the agent service to support 'mondai' type
declare module '@/services/agent-service' {
  interface ConversationContextOptions {
    agentType: "learn" | "earn" | "connect" | "mondai";
  }
}

const MonDAI = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [conversationId, setConversationId] = React.useState<string | null>(null);
  const [historicalContext, setHistoricalContext] = React.useState<string>('');
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [activeTab, setActiveTab] = React.useState<'chat' | 'knowledge' | 'documents'>('chat');
  const [documentUpdates, setDocumentUpdates] = React.useState<number>(0);
  
  // Initialize knowledge base with improved error handling
  const { 
    items: knowledgeItems,
    fetchKnowledgeItems,
    connectionStatus,
    errorMessage,
    reconnect
  } = useKnowledgeBase();

  // Set fullscreen mode effect for mobile
  React.useEffect(() => {
    // Add a class to the root element for fullscreen styling
    document.documentElement.classList.add('fullscreen-mode');
    
    // Remove the class when component unmounts
    return () => {
      document.documentElement.classList.remove('fullscreen-mode');
    };
  }, []);

  // Attempt to connect to KBAI on initial load
  React.useEffect(() => {
    const initKBAI = async () => {
      try {
        console.log("Initializing KBAI connection...");
        await fetchKnowledgeItems();
      } catch (error) {
        console.error("Error initializing KBAI:", error);
        toast({
          title: "Knowledge base connection issue",
          description: "Could not connect to KBAI service. Using fallback data.",
          variant: "destructive"
        });
      }
    };
    
    initKBAI();
  }, [fetchKnowledgeItems]);

  // Load conversation context when component mounts
  React.useEffect(() => {
    const loadContext = async () => {
      if (!conversationId) {
        console.log('No conversationId provided, skipping context load');
        return;
      }
      
      setIsLoading(true);
      try {
        // Use 'learn' instead of 'mondai' to match the existing agent types
        const context = await getConversationContext(conversationId, 'learn');
        if (context.historicalContext) {
          setHistoricalContext(context.historicalContext);
          console.log('Loaded historical context for MonDAI agent');
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

  // Handle document context updates
  const handleDocumentContextUpdated = () => {
    setDocumentUpdates(prev => prev + 1);
  };
  
  // Handle tab changes
  const handleTabChange = (tab: 'chat' | 'knowledge' | 'documents') => {
    setActiveTab(tab);
    
    // Refresh knowledge items when knowledge tab is selected
    if (tab === 'knowledge') {
      fetchKnowledgeItems();
    }
  };

  // Handle manual reconnection
  const handleManualReconnect = async () => {
    toast.info("Attempting to reconnect to knowledge base...");
    try {
      await reconnect();
    } catch (error) {
      toast.error("Reconnection failed", {
        description: "Please try again later"
      });
    }
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
        console.log('Updated historical context for MonDAI agent');
      }
      
      // Get relevant knowledge items for the message with better error handling
      let relevantKnowledgeItems = [];
      try {
        const kbaiService = getKBAIService();
        relevantKnowledgeItems = await kbaiService.fetchKnowledgeItems({
          query: message,
          limit: 3
        });
        console.log(`Found ${relevantKnowledgeItems.length} relevant knowledge items for query`);
      } catch (error) {
        console.warn('Error fetching knowledge items:', error);
        toast({
          title: "Knowledge Base Error",
          description: "Could not fetch relevant knowledge items. Using fallback data.",
          variant: "destructive" 
        });
      }
      
      const { data, error } = await supabase.functions.invoke('mondai-ai', {
        body: { 
          message, 
          userId: user?.id,
          conversationId: contextResult.conversationId,
          historicalContext: contextResult.historicalContext,
          knowledgeItems: relevantKnowledgeItems
        }
      });
      
      if (error) {
        console.error('Error calling MonDAI AI function:', error);
        throw new Error(error.message);
      }
      
      if (data.conversationId) {
        setConversationId(data.conversationId);
        console.log(`MCP conversation established with ID: ${data.conversationId}`);
      }
      
      // Store the interaction in the database for persistence
      await processAgentInteraction(
        message,
        'learn', // Use 'learn' instead of 'mondai'
        data.message,
        {
          conversationId: data.conversationId
        }
      );
      
      return {
        id: Date.now().toString(),
        sender: 'agent' as const,
        message: data.message,
        timestamp: data.timestamp || new Date().toISOString(),
        metadata: data.metadata || null
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

  // Show connection status alert if not connected
  const renderConnectionStatus = () => {
    if (connectionStatus === 'connected' || connectionStatus === 'connecting') return null;
    
    return (
      <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-md flex items-center">
        <AlertTriangle className="text-amber-500 mr-2" size={18} />
        <div className="flex-1 text-sm">
          <p className="font-medium">Knowledge Base Disconnected</p>
          <p className="text-muted-foreground text-xs mt-1">
            {errorMessage || "Could not establish connection to the knowledge base."}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleManualReconnect}
          className="ml-2 border-amber-500/40 text-amber-600 hover:text-amber-700"
        >
          Reconnect
        </Button>
      </div>
    );
  };

  return (
    <div className="container py-6 max-w-7xl mx-auto h-full agent-interface">
      <div className="grid gap-6 h-full">
        <div className="flex flex-col h-full">
          {renderConnectionStatus()}
          <AgentInterface
            title="MonDAI"
            description="Community agent with KBAI integration"
            agentType="learn" // Using learn type for compatibility
            onMessageSubmit={handleAIMessage}
            onDocumentAdded={handleDocumentContextUpdated}
            documentContextUpdated={documentUpdates}
            conversationId={conversationId}
            initialMessages={[
              {
                id: "1",
                sender: "agent",
                message: "Hello! I'm your MonDAI assistant with KBAI integration. I can help you learn about Web3, cryptocurrency, blockchain concepts, and more using my integrated knowledge base. What would you like to know about today?",
                timestamp: new Date().toISOString(),
                metadata: {
                  version: "1.0",
                  modelUsed: "gpt-4o",
                  knowledgeSource: "KBAI MCP"
                }
              }
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default MonDAI;
