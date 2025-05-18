
import { getKBAIService } from '@/integrations/kbai/KBAIMCPService';
import { getKBAIDirectService } from '@/integrations/kbai/KBAIDirectService';
import { getConversationContext, processAgentInteraction } from '@/services/agent-service';
import { toast } from 'sonner';
import { KBAIKnowledgeItem } from '@/integrations/kbai';

export interface MonDAIResponse {
  conversationId: string;
  message: string;
  timestamp: string;
  metadata: {
    version: string;
    modelUsed: string;
    knowledgeSource: string;
    itemsFound: number;
    [key: string]: any;
  };
}

/**
 * Processes a user query and generates a MonDAI response using KBAI integration
 */
export async function generateMonDAIResponse(
  message: string, 
  conversationId: string | null
): Promise<MonDAIResponse> {
  // Get conversation context if we have a conversationId
  let contextResult;
  if (conversationId) {
    // Always use 'learn' for mondai backend requests
    contextResult = await getConversationContext(conversationId, 'learn');
    conversationId = contextResult.conversationId;
  } else {
    // Generate a new conversation ID
    conversationId = crypto.randomUUID();
  }

  // Check if we're in fallback mode
  const directService = getKBAIDirectService();
  const isInFallbackMode = directService.isInFallbackMode();
  const connectionStatus = directService.getConnectionStatus();

  // Get relevant knowledge items for the message
  let relevantKnowledgeItems: KBAIKnowledgeItem[] = [];
  let knowledgeSource = "Offline Knowledge Base";
  
  try {
    // First check if we're asking about MonDAI specifically
    const isMonDAIQuery = message.toLowerCase().includes('mondai') || 
                         message.toLowerCase().includes('aigent') ||
                         message.toLowerCase().includes('crypto-agentic') ||
                         message.toLowerCase().includes('iqubes');
    
    if (isInFallbackMode) {
      console.log('Using direct fallback data for query', message);
      // Get fallback items directly from KBAI direct service
      relevantKnowledgeItems = await directService.fetchKnowledgeItems({
        query: isMonDAIQuery ? 'mondai' : message, // Force mondai items if it's a relevant query
        limit: 3
      });
    } else {
      // Try regular KBAI service first
      const kbaiService = getKBAIService();
      relevantKnowledgeItems = await kbaiService.fetchKnowledgeItems({
        query: isMonDAIQuery ? 'mondai' : message, // Force mondai items if it's a relevant query
        limit: 3
      });
      
      // If connected, update knowledge source
      if (kbaiService.getConnectionStatus() === 'connected') {
        knowledgeSource = "KBAI MCP Direct";
        toast.success('Successfully retrieved information from KBAI');
      }
    }
    
    console.log(`Found ${relevantKnowledgeItems.length} relevant knowledge items for query`);
  } catch (error) {
    console.warn('Error fetching knowledge items:', error);
    // Don't show error toast, just use fallback
  }

  // Generate response based on available knowledge
  let responseMessage = '';
  
  if (relevantKnowledgeItems.length > 0) {
    // Check if any of the items are about MonDAI
    const mondaiItems = relevantKnowledgeItems.filter(item => 
      item.type === 'agent-info' || (item.title && item.title.toLowerCase().includes('mondai'))
    );
    
    if (mondaiItems.length > 0) {
      // If we found MonDAI information items, create a more personalized response
      // Use a more concise format that summarizes the knowledge rather than quoting it directly
      responseMessage = `I'm Aigent MonDAI, your guide to crypto-agentic AI.

Based on what I know, I can help you understand ${mondaiItems[0].content.split('.')[0].trim().toLowerCase()}.

My capabilities include analyzing blockchain trends, providing personalized learning paths, and offering crypto risk assessments.

Is there a specific aspect of my functionality you'd like to explore?

${shouldOfferDiagram(message) ? 
  "\nWould you like me to create a diagram illustrating how I work with iQubes and blockchain data?" : ""}`;
    } else {
      // Regular response for other knowledge items - more concise and user-friendly
      const topicSummary = extractMainTopic(message);
      
      responseMessage = `Here's what I know about ${topicSummary}:

${summarizeKnowledgeItems(relevantKnowledgeItems)}

${shouldOfferDiagram(message) ? 
  "\nWould you like me to see a visual diagram explaining this concept?" : ""}

What specific aspect would you like to know more about?`;
    }
  } else {
    responseMessage = `I understand you're asking about "${extractMainTopic(message)}".

While I don't have specific knowledge items about this topic in my database, I can help with general information on Web3 and blockchain concepts.

Would you like to explore related topics instead? I'm happy to guide you through the basics if this is a new area for you.`;
  }

  return {
    conversationId,
    message: responseMessage,
    timestamp: new Date().toISOString(),
    metadata: {
      version: "1.0",
      modelUsed: "gpt-4o",
      knowledgeSource,
      itemsFound: relevantKnowledgeItems.length,
      connectionStatus,
      isOffline: isInFallbackMode
    }
  };
}

/**
 * Determine if we should offer to create a diagram based on the query content
 */
function shouldOfferDiagram(message: string): boolean {
  const complexTopics = [
    'how', 'process', 'workflow', 'architecture', 'structure', 
    'lifecycle', 'relationship', 'system', 'network', 'framework',
    'interaction', 'protocol', 'blockchain', 'consensus', 'transaction',
    'explain', 'mechanism', 'function', 'diagram'
  ];
  
  const messageLower = message.toLowerCase();
  return complexTopics.some(topic => messageLower.includes(topic));
}

/**
 * Extract the main topic from a user message
 */
function extractMainTopic(message: string): string {
  // Simple extraction of the main topic - could be enhanced with NLP
  const words = message.split(' ');
  if (words.length <= 3) return message;
  
  // Try to find key nouns by removing common question words
  const questionWords = ['what', 'how', 'why', 'when', 'where', 'who', 'is', 'are', 'can', 'could', 'would', 'will', 'do', 'does', 'about'];
  const filteredWords = words.filter(word => !questionWords.includes(word.toLowerCase()));
  
  if (filteredWords.length > 0) {
    return filteredWords.slice(0, 3).join(' ') + (filteredWords.length > 3 ? '...' : '');
  }
  
  return message.substring(0, 30) + (message.length > 30 ? '...' : '');
}

/**
 * Summarize knowledge items into a concise, readable format
 */
function summarizeKnowledgeItems(items: KBAIKnowledgeItem[]): string {
  if (!items || items.length === 0) return '';
  
  // Instead of directly quoting, create a summarized version
  let summary = '';
  
  items.forEach((item, index) => {
    // Extract key points from the content
    const contentLines = item.content.split(/\.\s+/).filter(line => line.length > 20);
    const keyPoints = contentLines.slice(0, 2).map(line => line.trim() + (line.endsWith('.') ? '' : '.'));
    
    if (keyPoints.length > 0) {
      summary += `• ${keyPoints.join(' ')}\n\n`;
    }
  });
  
  return summary.trim();
}

/**
 * Process a user message and generate a response, storing the interaction
 */
export async function processMonDAIInteraction(
  message: string,
  conversationId: string | null
) {
  // Generate response using the service
  const response = await generateMonDAIResponse(message, conversationId);
  
  // Store the interaction using the agent service - explicitly use 'learn' for mondai
  await processAgentInteraction(
    message,
    'learn', // Always use 'learn' instead of 'mondai' for backend compatibility
    response.message,
    {
      conversationId: response.conversationId
    }
  );
  
  return response;
}
