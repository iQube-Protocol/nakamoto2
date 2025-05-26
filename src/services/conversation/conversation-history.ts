
import { getConversationSummaries } from './conversation-summary';

// Constants for summarization logic
const SUMMARY_EXPIRATION_DAYS = 30; // Summaries expire after 30 days

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
