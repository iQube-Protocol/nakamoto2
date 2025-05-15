
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
  const contextInitPromise = useRef<Promise<void> | null>(null);
  
  // Initialize MCP context when conversation changes with deduplication
  useEffect(() => {
    if (conversationId && mcpClient && isInitialized && !contextInitialized.current) {
      // If we already have a pending initialization, don't start another
      if (contextInitPromise.current) {
        console.log(`MonDAI: Context initialization already in progress for ${conversationId}`);
        return;
      }

      console.log(`MonDAI: Initializing MCP context for conversation ID ${conversationId}`);
      
      // Create and store the initialization promise
      contextInitPromise.current = mcpClient.initializeContext(conversationId)
        .then(() => {
          console.log(`MonDAI: Successfully initialized context for conversation ${conversationId}`);
          contextInitialized.current = true;
          setDocumentUpdates(prev => prev + 1); // Force UI refresh
        })
        .catch(error => {
          console.error(`MonDAI: Failed to initialize context for conversation ${conversationId}:`, error);
          // Don't show toast here - too disruptive and not critical for user
        })
        .finally(() => {
          contextInitPromise.current = null;
        });
    } else if (conversationId) {
      console.log(`MonDAI: Conversation ID available (${conversationId}) but MCP not ready:`,
        { clientAvailable: !!mcpClient, isInitialized });
    }
  }, [conversationId, mcpClient, isInitialized]);
  
  // Throttled context initialization function
  const initializeContextIfNeeded = useCallback(async () => {
    if (!mcpClient || !conversationId) {
      return false;
    }
    
    if (contextInitialized.current) {
      return true;
    }
    
    // If we already have a pending initialization, wait for it
    if (contextInitPromise.current) {
      try {
        await contextInitPromise.current;
        return true;
      } catch (error) {
        return false;
      }
    }
    
    try {
      // Create new initialization promise
      contextInitPromise.current = mcpClient.initializeContext(conversationId)
        .then(() => {
          contextInitialized.current = true;
          console.log(`MonDAI: Late-initialized context for conversation ${conversationId}`);
        });
      
      await contextInitPromise.current;
      contextInitPromise.current = null;
      return true;
    } catch (error) {
      contextInitPromise.current = null;
      console.error('MonDAI: Failed to late-initialize context:', error);
      return false;
    }
  }, [mcpClient, conversationId]);
  
  // Handle AI message submission with throttling to prevent hammering the API
  const handleAIMessage = useCallback(
    async (message: string): Promise<AgentMessage> => {
      if (!message.trim()) return {
        id: `empty-${Date.now()}`,
        sender: 'agent',
        message: 'Please enter a message.',
        timestamp: new Date().toISOString(),
        metadata: { status: 'error' }
      };
      
      // Try to ensure context is initialized, but don't block if it fails
      await initializeContextIfNeeded().catch(() => {});
      
      setIsLoading(true);
      try {
        console.log(`MonDAI: Sending message to AI service, conversation: ${conversationId}`);
        
        // Add message to context if MCP is available - don't await this
        if (mcpClient && conversationId && contextInitialized.current) {
          mcpClient.addUserMessage(message)
            .then(() => console.log('MonDAI: Added user message to MCP context'))
            .catch(error => console.error('MonDAI: Failed to add message to context:', error));
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
        
        // Add response to context if MCP is available - don't await this
        if (mcpClient && conversationId && contextInitialized.current && data.response) {
          mcpClient.addAgentResponse(data.response)
            .then(() => console.log('MonDAI: Added agent response to MCP context'))
            .catch(error => console.error('MonDAI: Failed to add response to context:', error));
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
    [conversationId, mcpClient, initializeContextIfNeeded]
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
        
        // Try to initialize context first
        await initializeContextIfNeeded();
        
        // Add document to context - with a short timeout to not block UI
        setTimeout(() => {
          addDocumentToContext(document, conversationId)
            .then(() => {
              // Increment document updates to trigger refresh
              setDocumentUpdates(prev => prev + 1);
              console.log(`MonDAI: Document ${document.name} added to context`);
            })
            .catch(error => {
              console.error('Error in handleDocumentContextUpdated:', error);
              toast.error('Failed to add document to context', {
                description: error instanceof Error ? error.message : 'Unknown error'
              });
            });
        }, 100);
      } catch (error) {
        console.error('Error in handleDocumentContextUpdated:', error);
        toast.error('Failed to add document to context', {
          description: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    },
    [conversationId, addDocumentToContext, initializeContextIfNeeded]
  );
  
  return {
    conversationId,
    isLoading,
    documentUpdates,
    handleAIMessage,
    handleDocumentContextUpdated
  };
}
