
import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useConversationId } from '@/components/shared/agent/hooks/useConversationId';
import { useDocumentLoading } from '@/hooks/use-document-loading';
import { AgentMessage } from '@/lib/types';

export function useMondAI() {
  const [documentUpdates, setDocumentUpdates] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { conversationId } = useConversationId(null);
  const { addDocumentToContext } = useDocumentLoading();
  
  // Reset document updates counter when conversation changes
  useEffect(() => {
    if (conversationId) {
      console.log(`MonDAI: Initializing with conversation ID ${conversationId}`);
      setDocumentUpdates(0);
    }
  }, [conversationId]);
  
  // Handle AI message submission with retry
  const handleAIMessage = useCallback(
    async (message: string): Promise<AgentMessage> => {  // Explicitly typed as AgentMessage
      if (!message.trim()) return {
        id: `empty-${Date.now()}`,
        sender: 'agent' as const,  // Use const assertion to ensure correct type
        message: 'Please enter a message.',
        timestamp: new Date().toISOString(),
        metadata: { status: 'error' }
      };
      
      setIsLoading(true);
      try {
        console.log(`MonDAI: Sending message to AI service, conversation: ${conversationId}`);
        
        // Make request to Supabase Edge Function
        const { data, error } = await supabase.functions.invoke('mondai-ai', {
          body: { 
            message,
            conversationId
          }
        });
        
        if (error) {
          console.error('Edge function error:', error);
          throw new Error(`Error: ${error.message}`);
        }
        
        if (!data || !data.response) {
          console.error('Invalid response from mondai-ai function:', data);
          throw new Error('Invalid response from AI service');
        }
        
        console.log('MonDAI: Received response from AI service');
        
        return {
          id: data.id || `msg-${Date.now()}`,
          sender: 'agent' as const,  // Use const assertion to ensure correct type
          message: data.response,
          timestamp: new Date().toISOString(),
          metadata: {
            documentsUsed: data.documentsUsed || false,
            conversationId: data.conversationId || conversationId
          }
        };
      } catch (error) {
        console.error('Error in handleAIMessage:', error);
        toast.error('Failed to get AI response', {
          description: error instanceof Error ? error.message : 'Unknown error'
        });
        
        return {
          id: `error-${Date.now()}`,
          sender: 'agent' as const,  // Use const assertion to ensure correct type
          message: 'Sorry, I encountered an error processing your request. Please try again.',
          timestamp: new Date().toISOString(),
          metadata: { status: 'error' }
        };
      } finally {
        setIsLoading(false);
      }
    },
    [conversationId]
  );
  
  // Document context update handler with error handling
  const handleDocumentContextUpdated = useCallback(
    async (document: any) => {  // Keep the parameter
      try {
        console.log(`MonDAI: Processing document ${document.name} for context`);
        
        if (!conversationId) {
          console.error('No conversation ID available');
          toast.error('Cannot add document', {
            description: 'No active conversation'
          });
          return;
        }
        
        await addDocumentToContext(document, conversationId);
        
        // Increment document updates to trigger refresh
        setDocumentUpdates(prev => prev + 1);
        
        console.log(`MonDAI: Document ${document.name} added to context`);
      } catch (error) {
        console.error('Error in handleDocumentContextUpdated:', error);
        // Toast is already shown in addDocumentToContext
      }
    },
    [conversationId, addDocumentToContext]
  );
  
  return {
    conversationId,
    isLoading,
    documentUpdates,
    handleAIMessage,
    handleDocumentContextUpdated
  };
}
