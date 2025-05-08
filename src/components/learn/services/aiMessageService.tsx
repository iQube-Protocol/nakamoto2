
import React from 'react';
import { toast } from 'sonner';
import { AgentMessage } from '@/lib/types';
import { supabase } from '@/integrations/supabase/client';

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
      role: 'assistant',
      content: '...',
      createdAt: new Date().toISOString(),
      metadata: { status: 'pending' }
    };
    
    onMessageReceived(pendingMessage);

    // Prepare payload for edge function
    const payload = {
      message,
      conversationId,
      historicalContext
    };

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
      role: 'assistant',
      content: data.response,
      createdAt: new Date().toISOString(),
      conversationId: data.conversationId || conversationId,
      metadata: {
        status: 'complete',
        reliability: data.reliability || 0.85,
        sources: data.sources || []
      }
    };

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
      role: 'assistant',
      content: 'Sorry, I encountered an error processing your request. Please try again.',
      createdAt: new Date().toISOString(),
      metadata: { status: 'error' }
    };

    return errorMessage;
  }
};
