
import React from 'react';
import { toast } from 'sonner';
import { AgentMessage } from '@/lib/types';
import { supabase } from '@/integrations/supabase/client';
import { getMCPClient } from '@/integrations/mcp/client';

export const sendMessage = async (
  message: string,
  conversationId: string | null,
  agentType = 'learn',
  onMessageReceived: (message: AgentMessage) => void,
  historicalContext?: string
): Promise<AgentMessage> => {
  try {
    console.log(`Sending message to ${agentType} agent with conversation ID ${conversationId}`);

    // Create pending message to show in UI immediately
    const pendingMessage: AgentMessage = {
      id: `pending-${Date.now()}`,
      sender: 'agent',
      message: '...',
      timestamp: new Date().toISOString(),
      metadata: { status: 'pending' }
    };
    
    onMessageReceived(pendingMessage);

    // Get document context from MCP if available
    let documentContext = null;
    const mcpClient = getMCPClient();
    if (mcpClient) {
      const context = mcpClient.getModelContext();
      documentContext = context?.documentContext || null;
      if (documentContext) {
        console.log(`Including ${documentContext.length} documents in request to AI service:`, 
          documentContext.map(doc => doc.documentName));
      }
    }

    // Prepare payload for edge function
    const payload = {
      message,
      conversationId,
      historicalContext,
      documentContext // Include document context in the request
    };

    console.log("Full payload being sent to AI service:", JSON.stringify({
      ...payload,
      documentContext: documentContext ? `${documentContext.length} documents included` : 'none'
    }));

    // Call the appropriate edge function
    const { data, error } = await supabase.functions.invoke(`${agentType}-ai`, {
      body: payload
    });

    if (error) {
      throw new Error(`Edge function error: ${error.message}`);
    }

    // Process the response from the edge function
    if (!data || !data.response) {
      throw new Error('Invalid response from edge function');
    }

    // Create the full message with the response
    const responseMessage: AgentMessage = {
      id: data.id || `msg-${Date.now()}`,
      sender: 'agent',
      message: data.response,
      timestamp: new Date().toISOString(),
      metadata: {
        status: 'complete',
        reliability: data.reliability || 0.85,
        sources: data.sources || [],
        conversationId: data.conversationId || conversationId,
        documentsUsed: data.documentsUsed || false // Flag to indicate if documents were used
      }
    };

    if (data.documentsUsed) {
      console.log("AI response used documents in context");
      toast.success("Referenced documents in response", {
        description: "The AI used your uploaded documents to answer"
      });
    }

    // Return the complete message
    return responseMessage;
  } catch (error) {
    console.error('Error sending message:', error);
    
    // Show toast with error
    toast.error('Failed to get response', {
      description: error instanceof Error ? error.message : 'Unknown error occurred'
    });

    // Create error message
    const errorMessage: AgentMessage = {
      id: `error-${Date.now()}`,
      sender: 'agent',
      message: 'Sorry, I encountered an error processing your request. Please try again.',
      timestamp: new Date().toISOString(),
      metadata: { status: 'error' }
    };

    return errorMessage;
  }
};
