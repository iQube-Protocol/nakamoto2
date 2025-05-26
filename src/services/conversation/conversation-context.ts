
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Constants for summarization logic
const SUMMARIZATION_THRESHOLD = 10; // Summarize after 10 messages in a conversation

/**
 * Checks if a conversation needs summarization based on the number of interactions
 */
export const checkIfSummarizationNeeded = async (
  conversationId: string,
  agentType: 'learn' | 'earn' | 'connect'
): Promise<boolean> => {
  try {
    // Get the current user session to ensure we have a user_id
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) {
      console.error('No authenticated user found for summarization check');
      return false;
    }
    
    // Count unsummarized interactions for this conversation
    const { data: interactions, error } = await (supabase as any)
      .from('user_interactions')
      .select('id')
      .eq('user_id', session.user.id)
      .eq('interaction_type', agentType)
      .eq('summarized', false)
      .filter('metadata->conversationId', 'eq', conversationId);
    
    if (error) {
      console.error('Error checking for summarization:', error);
      return false;
    }
    
    console.log(`Found ${interactions?.length || 0} unsummarized interactions for conversation ${conversationId}`);
    
    // If there are more unsummarized interactions than our threshold, summarize
    return (interactions?.length || 0) >= SUMMARIZATION_THRESHOLD;
  } catch (error) {
    console.error('Error in checkIfSummarizationNeeded:', error);
    return false;
  }
};

/**
 * Prepares a conversation for a new session by checking if summarization 
 * is needed for past unsummarized interactions
 */
export const prepareConversationContext = async (
  agentType: 'learn' | 'earn' | 'connect',
  conversationId: string | null
): Promise<{ 
  conversationId: string, 
  historicalContext: string 
}> => {
  // Generate a new conversation ID if none provided
  const newConversationId = conversationId || crypto.randomUUID();
  
  // If we have an existing conversation ID, check if summarization is needed
  if (conversationId) {
    const needsSummarization = await checkIfSummarizationNeeded(conversationId, agentType);
    
    if (needsSummarization) {
      console.log(`Conversation ${conversationId} needs summarization, triggering...`);
      const { triggerConversationSummarize } = await import('./conversation-summary');
      await triggerConversationSummarize(conversationId, agentType);
      toast.success('Summarizing your previous conversations for better context.');
    }
  }
  
  // Get historical context regardless of summarization
  const { getHistoricalContextForPrompt } = await import('./conversation-history');
  const historicalContext = await getHistoricalContextForPrompt(agentType);
  console.log(`Historical context for ${agentType} (length: ${historicalContext.length}):\n${historicalContext}`);
  
  return {
    conversationId: newConversationId,
    historicalContext
  };
};
