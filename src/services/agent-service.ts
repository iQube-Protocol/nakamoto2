
import { storeUserInteraction } from './user-interaction-service';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const processAgentInteraction = async (
  query: string,
  agentType: 'learn' | 'earn' | 'connect',
  agentResponse: string,
  metadata: any = null
) => {
  try {
    console.log(`Processing ${agentType} agent interaction`);
    
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
    
    console.log(`Agent interaction: Storing for user ID ${session.user.id}`);
    
    // Store the interaction in the database with explicit user ID
    const result = await storeUserInteraction({
      query,
      response: agentResponse,
      interactionType: agentType,
      metadata,
      user_id: session.user.id
    });
    
    if (!result.success) {
      console.error('Failed to store agent interaction:', result.error);
      toast.error('Failed to save your conversation history');
    } else {
      console.log('Successfully stored agent interaction with ID:', result.data?.id);
    }
    
    return {
      success: true,
      response: agentResponse,
      interactionId: result.data?.id
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
