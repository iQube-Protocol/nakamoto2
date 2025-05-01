
import { storeUserInteraction } from './user-interaction-service';

export const processAgentInteraction = async (
  query: string,
  agentType: 'learn' | 'earn' | 'connect',
  agentResponse: string,
  metadata: any = null
) => {
  try {
    // First, store the interaction in the database
    const result = await storeUserInteraction({
      query,
      response: agentResponse,
      interactionType: agentType,
      metadata
    });
    
    if (!result.success) {
      console.error('Failed to store agent interaction:', result.error);
    }
    
    return {
      success: true,
      response: agentResponse,
    };
  } catch (error) {
    console.error('Error in agent interaction process:', error);
    return {
      success: false,
      error,
    };
  }
};
