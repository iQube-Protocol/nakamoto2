
import { storeUserInteraction } from './user-interaction-service';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { prepareConversationContext } from './conversation-summarizer';

export const processAgentInteraction = async (
  query: string,
  agentType: 'learn' | 'earn' | 'connect',
  agentResponse: string,
  metadata: any = null
) => {
  try {
    console.log(`==== PROCESSING ${agentType} AGENT INTERACTION ====`);
    
    // Get the current user session to ensure we have a user_id
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) {
      console.error('No authenticated user found for agent interaction');
      toast.error('You must be signed in to save conversation history');
      return {
        success: false,
        error: new Error('User not authenticated'),
        response: agentResponse,
      };
    }
    
    const userId = session.user.id;
    console.log(`Agent interaction: Processing for user ID ${userId}`);
    
    // Store the interaction in the database using the service method
    const result = await storeUserInteraction({
      query,
      response: agentResponse,
      interactionType: agentType,
      metadata,
      user_id: userId
    });
    
    if (!result.success) {
      console.error('Failed to store interaction:', result.error);
      
      // Try direct database insert as fallback
      console.log('Attempting direct database insert as fallback...');
      const { data: directData, error: directError } = await supabase
        .from('user_interactions')
        .insert({
          query,
          response: agentResponse,
          interaction_type: agentType,
          metadata,
          user_id: userId
        })
        .select();
      
      if (directError) {
        console.error('Direct DB insert also failed:', directError);
        toast.error('Failed to save your conversation history');
      } else {
        console.log('Direct DB insert succeeded with ID:', directData?.[0]?.id);
        return {
          success: true,
          response: agentResponse,
          interactionId: directData?.[0]?.id
        };
      }
    } else {
      console.log('Interaction stored successfully with ID:', result.data?.id);
      return {
        success: true,
        response: agentResponse,
        interactionId: result.data?.id
      };
    }
    
    return {
      success: true,
      response: agentResponse,
    };
  } catch (error) {
    console.error('Error in agent interaction process:', error);
    toast.error('Something went wrong with your request');
    return {
      success: false,
      error,
    };
  }
};

export const getConversationContext = async (
  conversationId: string | null,
  agentType: 'learn' | 'earn' | 'connect'
) => {
  try {
    // Prepare conversation context, including summaries if needed
    const context = await prepareConversationContext(agentType, conversationId);
    
    return {
      success: true,
      conversationId: context.conversationId,
      historicalContext: context.historicalContext
    };
  } catch (error) {
    console.error('Error preparing conversation context:', error);
    // Return a new conversation ID even if there's an error
    return {
      success: false,
      conversationId: conversationId || crypto.randomUUID(),
      historicalContext: '',
      error
    };
  }
};
