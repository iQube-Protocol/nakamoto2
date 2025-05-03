
import { MetaQube, BlakQube } from '@/lib/types';
import { supabase } from '@/integrations/supabase/client';
import { processAgentInteraction, getConversationContext } from '@/services/agent-service';
import { toast } from 'sonner';

export async function processAiMessage({
  message,
  metaQube,
  blakQube,
  conversationId,
  metisActive,
  mcpClient,
  historicalContext,
  setConversationId,
}) {
  try {
    // Get conversation context, including history if available
    let contextResult;
    try {
      contextResult = await getConversationContext(conversationId, 'learn');
    } catch (error) {
      console.error('Error getting conversation context:', error);
      // If context retrieval fails, create a fallback context
      contextResult = {
        conversationId: conversationId || crypto.randomUUID(),
        historicalContext: historicalContext || ''
      };
    }
    
    if (contextResult.conversationId !== conversationId && setConversationId) {
      setConversationId(contextResult.conversationId);
      console.log(`Setting new conversation ID: ${contextResult.conversationId}`);
    }
    
    // Get MCP context if available
    let documentContext = [];
    if (mcpClient) {
      try {
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
            if (doc && doc.content) {
              const contentPreview = doc.content.substring(0, 100) + (doc.content.length > 100 ? '...' : '');
              console.log(`Document ${index + 1} (${doc.documentName || 'unnamed'}) content preview:`, contentPreview);
            } else {
              console.warn(`Document ${index + 1} has invalid content:`, doc);
            }
          });
        }
      } catch (error) {
        console.error('Error getting MCP document context:', error);
        documentContext = [];
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
        historicalContext: contextResult.historicalContext || '',
        documentContext: documentContext
      }
    });
    
    if (error) {
      console.error('Error calling learn-ai function:', error);
      throw new Error(error.message);
    }
    
    if (data.conversationId && setConversationId) {
      setConversationId(data.conversationId);
      console.log(`MCP conversation established with ID: ${data.conversationId}`);
    }

    // Store the interaction in the database for persistence
    try {
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
    } catch (storeError) {
      console.error('Failed to store interaction in database:', storeError);
      // Continue even if storing fails - don't block the user experience
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
    toast.error("AI Service Error: Could not connect to the AI service. Please try again later.");
    
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
}
