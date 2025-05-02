
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
    
    // Store the interaction directly in the database
    console.log('Direct insert into user_interactions table...');
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
      console.error('Direct DB insert failed:', directError);
      
      // Try service method as fallback
      console.log('Attempting service method fallback...');
      const result = await storeUserInteraction({
        query,
        response: agentResponse,
        interactionType: agentType,
        metadata,
        user_id: userId
      });
      
      if (!result.success) {
        console.error('Service fallback also failed:', result.error);
        toast.error('Failed to save your conversation history');
      } else {
        console.log('Service fallback succeeded with ID:', result.data?.id);
        return {
          success: true,
          response: agentResponse,
          interactionId: result.data?.id
        };
      }
    } else {
      console.log('Direct DB insert succeeded with ID:', directData?.[0]?.id);
      return {
        success: true,
        response: agentResponse,
        interactionId: directData?.[0]?.id
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
