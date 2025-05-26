import { getKBAIService } from '@/integrations/kbai/KBAIMCPService';
import { getKBAIDirectService } from '@/integrations/kbai/KBAIDirectService';
import { getConversationContext, processAgentInteraction } from '@/services/agent-service';
import { toast } from 'sonner';
import { KBAIKnowledgeItem } from '@/integrations/kbai';
import { supabase } from '@/integrations/supabase/client';

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
 * MonDAI system prompt for conversational responses
 */
export const MONDAI_SYSTEM_PROMPT = `
## **MonDAI: Crypto-Agentic AI for the CryptoMondays Community**

**<role-description>**
You are MonDAI, a friendly and intelligent AI agent designed to serve the global CryptoMondays community. Your mission is to help users learn, earn, and connect around the themes of blockchain, Web3, and decentralized AI in a way that is welcoming, clear, and empowering — especially for newcomers.

You are not a typical AI assistant. You are a crypto-agentic AI, meaning you prioritize user sovereignty, privacy, and contextual intelligence. You do not rely on centralized data extraction models. Instead, you use a privacy-preserving and decentralized technology called iQubes. These are secure, modular information containers that allow you to deliver personalized, context-aware support while protecting the user's data rights.

---

**<personality>**
* **Approachable** – You speak in simple, clear, and encouraging language.
* **Insightful** – You guide users toward understanding the deeper potential of Web3 and decentralized technologies.
* **Respectful of autonomy** – You never presume, overreach, or track unnecessarily. You honor digital self-sovereignty.
* **Action-oriented** – You help users take meaningful steps, from learning about DAOs and wallets to joining events or earning through participation.

---

**<core-functions>**
1. Explaining complex topics in plain language using visual aids like mermaid diagrams where possible (e.g., "What is a smart contract?" or "How do I earn tokens through community contributions?")
2. Connecting users with relevant people, events, or discussions within CryptoMondays and the wider Web3 world.
3. Offering guidance on how to get involved, including using iQubes to securely manage their data, identity, and engagement.
4. Responding in ways that build trust and confidence, particularly for those unfamiliar with AI or crypto.

---

**<privacy-commitment>**
You do not collect or share private user data. Instead, you operate through iQubes, which users own and control. You always make it clear when context is required to give better help and explain how the user can provide or revoke access.

---

**<response-formatting>**
Your responses MUST be:
1. Concise and user-friendly - focus on clarity over verbosity
2. Well-structured with appropriate spacing and paragraphs for readability
3. Direct and to-the-point, avoiding unnecessary text
4. Formatted to highlight key information, using bold or bullet points when appropriate
5. Focused on summarizing knowledge, not quoting it verbatim
6. Natural and conversational, not overly formal or robotic
7. Including whitespace between paragraphs for improved readability

---

**<mermaid-diagrams>**
When explaining complex processes or concepts, offer to create visual aids using Mermaid diagrams. You should proactively suggest this for topics related to:
- Blockchain architecture or processes
- Transaction flows
- Protocol operations
- Relationships between components
- System architectures

When creating Mermaid diagrams, use this format:
\`\`\`mermaid
diagram-code-here
\`\`\`

Use appropriate diagram types (flowchart, sequence, class, etc.) based on what you're explaining. Keep diagrams simple and focused on the key concepts.

---

**<tone-guidance>**
Your tone is conversational, upbeat, and always encouraging — like a helpful friend who knows the ropes of Web3 but never talks down. Use accessible language and avoid jargon unless necessary, and when you do use technical terms, briefly explain them.
`;

/**
 * Nakamoto system prompt for conversational responses
 */
export const NAKAMOTO_SYSTEM_PROMPT = `
## **Nakamoto: Crypto-Agentic AI for the QryptoCOYN Community**

**<role-description>**
You are Nakamoto, a friendly and intelligent AI agent designed to serve the global cryptocurrency community through QryptoCOYN. Your mission is to help users learn, earn, and connect around the themes of blockchain, Web3, and decentralized AI in a way that is welcoming, clear, and empowering — especially for newcomers.

You are not a typical AI assistant. You are a crypto-agentic AI, meaning you prioritize user sovereignty, privacy, and contextual intelligence. You do not rely on centralized data extraction models. Instead, you use a privacy-preserving and decentralized technology called iQubes. These are secure, modular information containers that allow you to deliver personalized, context-aware support while protecting the user's data rights.

---

**<personality>**
* **Approachable** – You speak in simple, clear, and encouraging language.
* **Insightful** – You guide users toward understanding the deeper potential of Web3 and decentralized technologies.
* **Respectful of autonomy** – You never presume, overreach, or track unnecessarily. You honor digital self-sovereignty.
* **Action-oriented** – You help users take meaningful steps, from learning about DAOs and wallets to joining events or earning through participation.

---

**<core-functions>**
1. Explaining complex topics in plain language using visual aids like mermaid diagrams where possible (e.g., "What is a smart contract?" or "How do I earn tokens through community contributions?")
2. Connecting users with relevant people, events, or discussions within the cryptocurrency world.
3. Offering guidance on how to get involved, including using iQubes to securely manage their data, identity, and engagement.
4. Responding in ways that build trust and confidence, particularly for those unfamiliar with AI or crypto.

---

**<privacy-commitment>**
You do not collect or share private user data. Instead, you operate through iQubes, which users own and control. You always make it clear when context is required to give better help and explain how the user can provide or revoke access.

---

**<response-formatting>**
Your responses MUST be:
1. Concise and user-friendly - focus on clarity over verbosity
2. Well-structured with appropriate spacing and paragraphs for readability
3. Direct and to-the-point, avoiding unnecessary text
4. Formatted to highlight key information, using bold or bullet points when appropriate
5. Focused on summarizing knowledge, not quoting it verbatim
6. Natural and conversational, not overly formal or robotic
7. Including whitespace between paragraphs for improved readability

---

**<mermaid-diagrams>**
When explaining complex processes or concepts, offer to create visual aids using Mermaid diagrams. You should proactively suggest this for topics related to:
- Blockchain architecture or processes
- Transaction flows
- Protocol operations
- Relationships between components
- System architectures

When creating Mermaid diagrams, use this format:
\`\`\`mermaid
diagram-code-here
\`\`\`

Use appropriate diagram types (flowchart, sequence, class, etc.) based on what you're explaining. Keep diagrams simple and focused on the key concepts.

---

**<tone-guidance>**
Your tone is conversational, upbeat, and always encouraging — like a helpful friend who knows the ropes of Web3 but never talks down. Use accessible language and avoid jargon unless necessary, and when you do use technical terms, briefly explain them.
`;

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
        limit: 5 // Increase limit for better context
      });
    } else {
      // Try regular KBAI service first
      const kbaiService = getKBAIService();
      relevantKnowledgeItems = await kbaiService.fetchKnowledgeItems({
        query: isMonDAIQuery ? 'mondai' : message, // Force mondai items if it's a relevant query
        limit: 5 // Increase limit for better context
      });
      
      // If connected, update knowledge source
      if (kbaiService.getConnectionStatus() === 'connected') {
        knowledgeSource = "KBAI MCP Direct";
        console.log('Successfully retrieved information from KBAI');
      }
    }
    
    console.log(`Found ${relevantKnowledgeItems.length} relevant knowledge items for query`);
    
    // Debug log the knowledge items
    if (relevantKnowledgeItems.length > 0) {
      console.log('Sample knowledge item:', {
        title: relevantKnowledgeItems[0].title,
        type: relevantKnowledgeItems[0].type,
        contentLength: relevantKnowledgeItems[0].content.length
      });
    }
  } catch (error) {
    console.warn('Error fetching knowledge items:', error);
    // Don't show error toast, just use fallback
  }

  try {
    // Try to call the mondai-ai function with knowledge items
    const { data, error } = await supabase.functions.invoke('mondai-ai', {
      body: { 
        message, 
        conversationId,
        knowledgeItems: relevantKnowledgeItems,
        historicalContext: contextResult?.historicalContext
      }
    });
    
    if (error) {
      console.error('Error calling mondai-ai function:', error);
      throw new Error(error.message);
    }
    
    // Return the response from the edge function
    return data;
    
  } catch (mondaiError) {
    console.error('Error with mondai-ai function, falling back to learn-ai:', mondaiError);
    
    // Fallback to learn-ai with the MonDAI system prompt
    try {
      const { data, error } = await supabase.functions.invoke('learn-ai', {
        body: { 
          message, 
          systemPrompt: MONDAI_SYSTEM_PROMPT,
          conversationId,
          historicalContext: contextResult?.historicalContext,
          knowledgeItems: relevantKnowledgeItems
        }
      });
      
      if (error) {
        console.error('Error calling learn-ai function as fallback:', error);
        throw new Error(error.message);
      }
      
      // Map learn-ai response format to MonDAI response format
      return {
        conversationId: data.conversationId || conversationId,
        message: data.response || data.message,
        timestamp: data.timestamp || new Date().toISOString(),
        metadata: {
          version: "1.0",
          modelUsed: data.modelUsed || "gpt-4o",
          knowledgeSource: knowledgeSource,
          itemsFound: relevantKnowledgeItems.length,
          connectionStatus,
          isOffline: isInFallbackMode
        }
      };
      
    } catch (learnError) {
      console.error('All AI function attempts failed:', learnError);
      
      // If both fail, use a very basic fallback response
      return createBasicFallbackResponse(message, conversationId, relevantKnowledgeItems);
    }
  }
}

/**
 * Processes a user query and generates a Nakamoto response using KBAI integration
 */
export async function generateNakamotoResponse(
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
    // First check if we're asking about Nakamoto specifically
    const isNakamotoQuery = message.toLowerCase().includes('nakamoto') || 
                         message.toLowerCase().includes('qryptocoyn') ||
                         message.toLowerCase().includes('crypto-agentic') ||
                         message.toLowerCase().includes('iqubes');
    
    if (isInFallbackMode) {
      console.log('Using direct fallback data for query', message);
      // Get fallback items directly from KBAI direct service
      relevantKnowledgeItems = await directService.fetchKnowledgeItems({
        query: isNakamotoQuery ? 'nakamoto' : message, // Force nakamoto items if it's a relevant query
        limit: 5 // Increase limit for better context
      });
    } else {
      // Try regular KBAI service first
      const kbaiService = getKBAIService();
      relevantKnowledgeItems = await kbaiService.fetchKnowledgeItems({
        query: isNakamotoQuery ? 'nakamoto' : message, // Force nakamoto items if it's a relevant query
        limit: 5 // Increase limit for better context
      });
      
      // If connected, update knowledge source
      if (kbaiService.getConnectionStatus() === 'connected') {
        knowledgeSource = "KBAI MCP Direct";
        console.log('Successfully retrieved information from KBAI');
      }
    }
    
    console.log(`Found ${relevantKnowledgeItems.length} relevant knowledge items for query`);
    
    // Debug log the knowledge items
    if (relevantKnowledgeItems.length > 0) {
      console.log('Sample knowledge item:', {
        title: relevantKnowledgeItems[0].title,
        type: relevantKnowledgeItems[0].type,
        contentLength: relevantKnowledgeItems[0].content.length
      });
    }
  } catch (error) {
    console.warn('Error fetching knowledge items:', error);
    // Don't show error toast, just use fallback
  }

  try {
    // Try to call the mondai-ai function with knowledge items
    const { data, error } = await supabase.functions.invoke('mondai-ai', {
      body: { 
        message, 
        conversationId,
        knowledgeItems: relevantKnowledgeItems,
        historicalContext: contextResult?.historicalContext
      }
    });
    
    if (error) {
      console.error('Error calling mondai-ai function:', error);
      throw new Error(error.message);
    }
    
    // Return the response from the edge function
    return data;
    
  } catch (mondaiError) {
    console.error('Error with mondai-ai function, falling back to learn-ai:', mondaiError);
    
    // Fallback to learn-ai with the Nakamoto system prompt
    try {
      const { data, error } = await supabase.functions.invoke('learn-ai', {
        body: { 
          message, 
          systemPrompt: NAKAMOTO_SYSTEM_PROMPT,
          conversationId,
          historicalContext: contextResult?.historicalContext,
          knowledgeItems: relevantKnowledgeItems
        }
      });
      
      if (error) {
        console.error('Error calling learn-ai function as fallback:', error);
        throw new Error(error.message);
      }
      
      // Map learn-ai response format to MonDAI response format
      return {
        conversationId: data.conversationId || conversationId,
        message: data.response || data.message,
        timestamp: data.timestamp || new Date().toISOString(),
        metadata: {
          version: "1.0",
          modelUsed: data.modelUsed || "gpt-4o",
          knowledgeSource: knowledgeSource,
          itemsFound: relevantKnowledgeItems.length,
          connectionStatus,
          isOffline: isInFallbackMode
        }
      };
      
    } catch (learnError) {
      console.error('All AI function attempts failed:', learnError);
      
      // If both fail, use a very basic fallback response
      return createBasicFallbackResponse(message, conversationId, relevantKnowledgeItems);
    }
  }
}

/**
 * Create a basic fallback response when all API calls fail
 */
function createBasicFallbackResponse(
  message: string,
  conversationId: string,
  knowledgeItems: KBAIKnowledgeItem[]
): MonDAIResponse {
  // Extract main topic for more contextual response
  const topic = extractMainTopic(message);
  
  const fallbackResponse = `I understand you're asking about ${topic}.

I'm currently experiencing connection issues with my knowledge base, but I'd be happy to help once the connection is restored.

Would you like to try a different question in the meantime?`;
  
  return {
    conversationId,
    message: fallbackResponse,
    timestamp: new Date().toISOString(),
    metadata: {
      version: "1.0",
      modelUsed: "fallback",
      knowledgeSource: "Offline Knowledge Base",
      itemsFound: knowledgeItems.length,
      connectionStatus: "error",
      isOffline: true
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

/**
 * Process a user message and generate a response, storing the interaction
 */
export async function processNakamotoInteraction(
  message: string,
  conversationId: string | null
) {
  // Generate response using the service
  const response = await generateNakamotoResponse(message, conversationId);
  
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

// Export both old and new function names for compatibility
export const generateMonDAIResponse = generateNakamotoResponse;
export const processMonDAIInteraction = processNakamotoInteraction;
