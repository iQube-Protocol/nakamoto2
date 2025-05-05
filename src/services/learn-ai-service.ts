
import { supabase } from '@/integrations/supabase/client';
import { MetaQube, BlakQube } from '@/lib/types';
import { processAgentInteraction } from '@/services/agent-service';

interface AIResponse {
  id: string;
  sender: 'agent';
  message: string;
  timestamp: string;
  metadata: any;
}

export const sendMessageToLearnAI = async (
  message: string,
  contextResult: { conversationId: string | null; historicalContext: string },
  metaQube: MetaQube,
  blakQube?: BlakQube,
  mcpClient?: any,
  metisActive: boolean = false
): Promise<AIResponse> => {
  try {
    // Get MCP context if available
    let documentContext: any[] = [];
    if (mcpClient) {
      const mcpContext = mcpClient.getModelContext();
      if (mcpContext?.documentContext) {
        documentContext = mcpContext.documentContext;
        console.log('MCP: Including document context in request', {
          documentCount: documentContext.length,
          documentIds: documentContext.map((doc: any) => doc.documentId),
          documentNames: documentContext.map((doc: any) => doc.documentName)
        });
        
        // Log a sample of each document's content to verify it's being sent
        documentContext.forEach((doc: any, index: number) => {
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
    throw error;
  }
};
