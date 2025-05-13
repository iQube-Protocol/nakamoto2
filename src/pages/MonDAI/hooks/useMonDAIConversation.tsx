
import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { processAgentInteraction, getConversationContext } from '@/services/agent-service';
import { getKBAIService } from '@/integrations/kbai';
import { toast } from 'sonner';

export const useMonDAIConversation = (initialConversationId: string | null = null) => {
  const { user } = useAuth();
  const [conversationId, setConversationId] = React.useState<string | null>(initialConversationId);
  const [historicalContext, setHistoricalContext] = React.useState<string>('');
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

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
      toast("AI Service Error: Could not connect to the AI service. Please try again later.");
      
      return {
        id: Date.now().toString(),
        sender: 'agent' as const,
        message: "I'm sorry, I couldn't process your request. Please try again later.",
        timestamp: new Date().toISOString(),
      };
    }
  };

  return {
    conversationId,
    historicalContext,
    isLoading,
    handleAIMessage
  };
};
