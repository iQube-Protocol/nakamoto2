
import { storeUserInteraction } from './user-interaction-service';
import { toast } from 'sonner';

export const processAgentInteraction = async (
  query: string,
  agentType: 'learn' | 'earn' | 'connect',
  agentResponse: string,
  metadata: any = null
) => {
  try {
    console.log(`Processing ${agentType} agent interaction`);
    
    // First, store the interaction in the database
    const result = await storeUserInteraction({
      query,
      response: agentResponse,
      interactionType: agentType,
      metadata
    });
    
    if (!result.success) {
      console.error('Failed to store agent interaction:', result.error);
      toast.error('Failed to save your conversation history');
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
