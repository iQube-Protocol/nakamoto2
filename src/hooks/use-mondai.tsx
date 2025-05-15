
import { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useConversationId } from '@/components/shared/agent/hooks/useConversationId';
import { useDocumentLoading } from '@/hooks/use-document-loading';
import { AgentMessage } from '@/lib/types';
import { useMCP } from '@/hooks/use-mcp';

export function useMondAI() {
  const [documentUpdates, setDocumentUpdates] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { conversationId } = useConversationId(null);
  const { addDocumentToContext } = useDocumentLoading();
  const { client: mcpClient, isInitialized, reinitializeClient } = useMCP();
  const contextInitialized = useRef<boolean>(false);
  
  // Initialize MCP context when conversation changes
  useEffect(() => {
    if (conversationId && mcpClient && isInitialized && !contextInitialized.current) {
      console.log(`MonDAI: Initializing MCP context for conversation ID ${conversationId}`);
      mcpClient.initializeContext(conversationId)
        .then(() => {
          console.log(`MonDAI: Successfully initialized context for conversation ${conversationId}`);
          contextInitialized.current = true;
          setDocumentUpdates(prev => prev + 1); // Force UI refresh
        })
        .catch(error => {
          console.error(`MonDAI: Failed to initialize context for conversation ${conversationId}:`, error);
          toast.error('Failed to initialize document context', {
            description: 'Try refreshing the page or adding documents again'
          });
        });
    } else if (conversationId) {
      console.log(`MonDAI: Conversation ID available (${conversationId}) but MCP not ready:`,
        { clientAvailable: !!mcpClient, isInitialized });
    }
  }, [conversationId, mcpClient, isInitialized]);
  
  // Handle AI message submission with retry and robust error handling
  const handleAIMessage = useCallback(
    async (message: string): Promise<AgentMessage> => {
      if (!message.trim()) return {
        id: `empty-${Date.now()}`,
        sender: 'agent',
        message: 'Please enter a message.',
        timestamp: new Date().toISOString(),
        metadata: { status: 'error' }
      };
      
      // Ensure context is initialized
      if (mcpClient && conversationId && !contextInitialized.current) {
        try {
          await mcpClient.initializeContext(conversationId);
          console.log(`MonDAI: Late-initialized context for conversation ${conversationId}`);
          contextInitialized.current = true;
        } catch (error) {
          console.error('MonDAI: Failed to late-initialize context:', error);
          // Continue anyway, as we might still be able to handle the message
        }
      }
      
      setIsLoading(true);
      try {
        console.log(`MonDAI: Sending message to AI service, conversation: ${conversationId}`);
        
        // Add message to context if MCP is available
        if (mcpClient && conversationId && contextInitialized.current) {
          try {
            await mcpClient.addUserMessage(message);
            console.log('MonDAI: Added user message to MCP context');
          } catch (error) {
            console.error('MonDAI: Failed to add message to context:', error);
            // Non-fatal, continue with request
          }
        }
        
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
        
        // Add response to context if MCP is available
        if (mcpClient && conversationId && contextInitialized.current && data.response) {
          try {
            await mcpClient.addAgentResponse(data.response);
            console.log('MonDAI: Added agent response to MCP context');
          } catch (error) {
            console.error('MonDAI: Failed to add response to context:', error);
            // Non-fatal, continue with response handling
          }
        }
        
        return {
          id: data.id || `msg-${Date.now()}`,
          sender: 'agent',
          message: data.response,
          timestamp: new Date().toISOString(),
          metadata: {
            documentsUsed: data.documentsUsed || false,
            conversationId: data.conversationId || conversationId
          }
        };
      } catch (error) {
        console.error('Error in handleAIMessage:', error);
        
        // Handle specific error types
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        // Check for network-related errors
        if (errorMessage.includes('network') || errorMessage.includes('connection')) {
          toast.error('Network error', {
            description: 'Please check your internet connection and try again'
          });
        } else {
          toast.error('Failed to get AI response', {
            description: errorMessage
          });
        }
        
        return {
          id: `error-${Date.now()}`,
          sender: 'agent',
          message: 'Sorry, I encountered an error processing your request. Please try again.',
          timestamp: new Date().toISOString(),
          metadata: { status: 'error' }
        };
      } finally {
        setIsLoading(false);
      }
    },
    [conversationId, mcpClient, contextInitialized]
  );
  
  // Document context update handler with improved error handling
  const handleDocumentContextUpdated = useCallback(
    async (document: any) => {
      try {
        console.log(`MonDAI: Processing document ${document.name} for context`);
        
        if (!conversationId) {
          console.error('No conversation ID available');
          toast.error('Cannot add document', {
            description: 'No active conversation'
          });
          return;
        }
        
        // If MCP client isn't initialized, try to reinitialize
        if (!mcpClient || !isInitialized) {
          toast.info('Initializing document system...', {
            duration: 3000
          });
          
          // Try to reinitialize
          const success = reinitializeClient();
          if (!success) {
            throw new Error('Could not initialize document system');
          }
          
          // Allow time for initialization
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        // Make sure context is initialized for this conversation
        if (mcpClient && !contextInitialized.current) {
          await mcpClient.initializeContext(conversationId);
          contextInitialized.current = true;
          console.log(`MonDAI: Late-initialized context for conversation ${conversationId}`);
        }
        
        // Add document to context
        await addDocumentToContext(document, conversationId);
        
        // Increment document updates to trigger refresh
        setDocumentUpdates(prev => prev + 1);
        
        console.log(`MonDAI: Document ${document.name} added to context`);
      } catch (error) {
        console.error('Error in handleDocumentContextUpdated:', error);
        toast.error('Failed to add document to context', {
          description: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    },
    [conversationId, mcpClient, isInitialized, reinitializeClient, addDocumentToContext]
  );
  
  return {
    conversationId,
    isLoading,
    documentUpdates,
    handleAIMessage,
    handleDocumentContextUpdated
  };
}
