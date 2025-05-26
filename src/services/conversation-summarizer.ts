
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ConversationSummary {
  id: string;
  user_id: string;
  conversation_type: 'learn' | 'earn' | 'connect';
  summary_text: string;
  included_interaction_ids: string[];
  created_at: string;
  updated_at: string;
}

// Constants for summarization logic
const SUMMARIZATION_THRESHOLD = 10; // Summarize after 10 messages in a conversation
const SUMMARY_EXPIRATION_DAYS = 30; // Summaries expire after 30 days

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
 * Gets historical conversation summaries for a given agent type
 */
export const getConversationSummaries = async (
  agentType: 'learn' | 'earn' | 'connect'
): Promise<ConversationSummary[]> => {
  try {
    // Get the current user session to ensure we have a user_id
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) {
      console.error('No authenticated user found for retrieving summaries');
      return [];
    }
    
    // Get relevant summaries for the user and agent type, ordered by creation date
    const { data: summaries, error } = await (supabase as any)
      .from('conversation_summaries')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('conversation_type', agentType)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error retrieving conversation summaries:', error);
      return [];
    }
    
    console.log(`Retrieved ${summaries?.length || 0} summaries for ${agentType} agent`);
    
    // Type assertion to ensure compatibility with our ConversationSummary interface
    // This is safe because we've filtered by agentType which ensures conversation_type is valid
    return (summaries || []) as ConversationSummary[];
  } catch (error) {
    console.error('Error in getConversationSummaries:', error);
    return [];
  }
};

/**
 * Triggers summarization of a conversation via the edge function
 */
export const triggerConversationSummarize = async (
  conversationId: string,
  agentType: 'learn' | 'earn' | 'connect'
): Promise<boolean> => {
  try {
    console.log(`Triggering summarization for ${agentType} conversation ${conversationId}`);
    
    // Get the current user session to ensure we have a user_id
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) {
      console.error('No authenticated user found for summarization');
      return false;
    }
    
    // Call the edge function to summarize the conversation
    const { data, error } = await supabase.functions.invoke('summarize-history', {
      body: { 
        conversationId, 
        agentType,
        userId: session.user.id
      }
    });
    
    if (error) {
      console.error('Error calling summarize-history function:', error);
      return false;
    }
    
    if (!data?.success) {
      console.error('Summarization failed:', data?.error);
      return false;
    }
    
    console.log('Summarization completed successfully:', data);
    return true;
  } catch (error) {
    console.error('Error in triggerConversationSummarize:', error);
    return false;
  }
};

/**
 * Gets the most recent conversations with their summaries for context
 * Returns a formatted context string that can be added to system prompts
 */
export const getHistoricalContextForPrompt = async (
  agentType: 'learn' | 'earn' | 'connect',
  maxSummaries: number = 3
): Promise<string> => {
  const summaries = await getConversationSummaries(agentType);
  
  if (summaries.length === 0) {
    return '';
  }
  
  // Get the most recent summaries
  const recentSummaries = summaries.slice(0, maxSummaries);
  
  // Format them for inclusion in a prompt
  let contextString = `\n\n<conversation-history>\n`;
  contextString += `The user has had previous conversations with you. Here are summaries of past interactions:\n\n`;
  
  recentSummaries.forEach((summary, index) => {
    contextString += `Summary ${index + 1} (${new Date(summary.created_at).toLocaleDateString()}): ${summary.summary_text}\n\n`;
  });
  
  contextString += `</conversation-history>`;
  
  return contextString;
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
      await triggerConversationSummarize(conversationId, agentType);
      toast.success('Summarizing your previous conversations for better context.');
    }
  }
  
  // Get historical context regardless of summarization
  const historicalContext = await getHistoricalContextForPrompt(agentType);
  console.log(`Historical context for ${agentType} (length: ${historicalContext.length}):\n${historicalContext}`);
  
  return {
    conversationId: newConversationId,
    historicalContext
  };
};
