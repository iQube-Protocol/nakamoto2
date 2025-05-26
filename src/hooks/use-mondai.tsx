import React from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { getConversationContext } from '@/services/agent-service';
import { AgentMessage } from '@/lib/types';
import { processMonDAIInteraction } from '@/services/mondai-service';
import { generateAigentNakamotoResponse } from '@/services/qrypto-mondai-service';

export function useMondAI() {
  const { toast: uiToast } = useToast();
  const { user } = useAuth();
  const [conversationId, setConversationId] = React.useState<string | null>(null);
  const [historicalContext, setHistoricalContext] = React.useState<string>('');
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [activeTab, setActiveTab] = React.useState<'chat' | 'knowledge' | 'documents'>('chat');
  const [documentUpdates, setDocumentUpdates] = React.useState<number>(0);

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
  };

  const handleAIMessage = async (message: string) => {
    try {
      // Use the enhanced Qrypto COYN service
      const response = await generateAigentNakamotoResponse(message, conversationId);
      
      // Update conversation ID if it changed
      if (response.conversationId !== conversationId) {
        setConversationId(response.conversationId);
        console.log(`Setting new conversation ID: ${response.conversationId}`);
      }
      
      // Return a properly formatted agent message
      return {
        id: Date.now().toString(),
        sender: 'agent' as const,
        message: response.message,
        timestamp: response.timestamp,
        metadata: response.metadata
      };
    } catch (error) {
      console.error('Failed to get AI response:', error);
      uiToast({
        title: "AI Service Error",
        description: "Could not connect to the AI service. Please try again later.",
        variant: "destructive"
      });
      
      // Return error message if the service fails
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
    isLoading,
    activeTab,
    documentUpdates,
    handleAIMessage,
    handleDocumentContextUpdated,
    handleTabChange,
  };
}
