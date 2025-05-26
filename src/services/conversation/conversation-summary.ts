
import { supabase } from '@/integrations/supabase/client';

interface ConversationSummary {
  id: string;
  user_id: string;
  conversation_type: 'learn' | 'earn' | 'connect';
  summary_text: string;
  included_interaction_ids: string[];
  created_at: string;
  updated_at: string;
}

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

export type { ConversationSummary };
