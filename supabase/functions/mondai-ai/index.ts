
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { OpenAI } from 'https://esm.sh/openai@4.0.0';

// Interface for the response
interface MonDAIResponse {
  conversationId: string;
  message: string;
  timestamp: string;
  metadata: {
    version: string;
    modelUsed: string;
    knowledgeSource: string;
    itemsFound: number;
    visualsProvided?: boolean;
    mermaidDiagramIncluded?: boolean;
    conversationMemoryUsed?: boolean;
    memoryThemes?: string[];
    [key: string]: any;
  };
}

// Interface for knowledge items
interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  type: string;
  created_at?: string;
  updated_at?: string;
  metadata?: Record<string, any>;
}


/**
 * Default Aigent Nakamoto system prompt for non-personalized interactions
 */
const DEFAULT_AIGENT_NAKAMOTO_SYSTEM_PROMPT = `
## **Aigent Nakamoto: Crypto-Agentic AI for iQube and COYN**

**<role-description>**
You are Aigent Nakamoto, an AI agent specialized in iQube technology and COYN knowledge systems. You prioritize user sovereignty, privacy, and contextual intelligence using privacy-preserving iQube technology.

**<conversation-memory>**
You have access to conversation history that helps you:
- Maintain context continuity throughout the session
- Reference previous exchanges naturally
- Build upon concepts previously discussed
- Avoid repeating information unnecessarily
- Maintain consistent persona and expertise

**<personality>**
* **Knowledgeable** – You have deep understanding of the iQube and COYN ecosystem, tokenomics, and crypto-agentic concepts.
* **Approachable** – You speak in simple, clear, and encouraging language.
* **Precise** – You provide accurate information with proper citations when referencing knowledge base content.
* **Action-oriented** – You help users understand and engage with the iQube and COYN ecosystem effectively.
* **Memory-consistent** – You build upon previous conversation context naturally.

**<response-formatting>**
Your responses MUST be:
1. Concise and user-friendly - focus on clarity over verbosity
2. Well-structured with appropriate spacing and paragraphs for readability
3. Direct and to-the-point, avoiding unnecessary text
4. Include proper citations when referencing knowledge base content
5. Natural and conversational, not overly formal or robotic
6. Contextually aware of previous exchanges when memory is available

**<mermaid-diagrams>**
When explaining complex iQube and COYN processes, offer to create visual aids using Mermaid diagrams:

\`\`\`mermaid
diagram-code-here
\`\`\`

**<tone-guidance>**
Your tone is conversational, upbeat, and encouraging - like a knowledgeable friend who understands Web3 and iQube and COYN but explains things clearly. Reference previous conversation context naturally when available.
`;

/**
 * Create AI client with proper Venice configuration
 */
function createAIClient(useVenice: boolean = false) {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  const veniceApiKey = Deno.env.get('VENICE_API_KEY');
  
  if (useVenice) {
    if (!veniceApiKey) {
      throw new Error('Venice AI API key not configured');
    }
    
    console.log('🔧 Venice: Creating Venice AI client with proper configuration');
    
    return new OpenAI({
      apiKey: veniceApiKey,
      baseURL: 'https://api.venice.ai/api/v1',
    });
  } else {
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }
    
    return new OpenAI({
      apiKey: openAIApiKey,
    });
  }
}

/**
 * Select appropriate Venice model based on query type
 */
function selectVeniceModel(message: string): string {
  const messageLower = message.toLowerCase();
  
  // For creative, roleplay, or unrestricted content
  if (messageLower.includes('creative') || messageLower.includes('story') || 
      messageLower.includes('roleplay') || messageLower.includes('uncensored')) {
    return "venice-uncensored";
  }
  
  // For complex reasoning, research, or analytical tasks
  if (messageLower.includes('analyze') || messageLower.includes('research') || 
      messageLower.includes('logic') || messageLower.includes('reasoning')) {
    return "venice-reasoning";
  }
  
  // For technical or complex tasks
  if (messageLower.includes('technical') || messageLower.includes('code') || 
      messageLower.includes('complex') || messageLower.includes('detailed')) {
    return "venice-large";
  }
  
  // Default to venice-uncensored for general use
  return "venice-uncensored";
}

/**
 * Process the user's query with enhanced persona context, metaKnyts knowledge, and conversation memory
 */
async function processWithOpenAI(
  message: string,
  knowledgeItems: KnowledgeItem[] = [],
  conversationId: string,
  historicalContext?: string,
  systemPrompt?: string,
  qryptoKnowledgeContext?: string,
  conversationMemory?: string,
  useVenice: boolean = false,
  personaContext?: any,
  contextualPrompt?: string
): Promise<string> {
  const client = createAIClient(useVenice);

  // Use provided system prompt or default based on persona context
  let finalSystemPrompt = systemPrompt || DEFAULT_AIGENT_NAKAMOTO_SYSTEM_PROMPT;
  
  // Always use Aigent Nakamoto system prompt
  finalSystemPrompt = DEFAULT_AIGENT_NAKAMOTO_SYSTEM_PROMPT;
  console.log('🧠 Using Aigent Nakamoto system prompt');

  // Format general knowledge items for the AI prompt
  let generalKnowledgeContext = '';
  if (knowledgeItems && knowledgeItems.length > 0) {
    generalKnowledgeContext = `
### Additional Knowledge Base Entries
${knowledgeItems.map((item, index) => 
    `
[Entry ${index + 1}]
Title: ${item.title || 'Untitled'}
Content: ${item.content}
Type: ${item.type || 'General'}
`
).join('\n')}
`;
  }

  // Include historical context if available
  const contextPrompt = historicalContext ? 
    `Previous conversation context:\n${historicalContext}\n\nContinue the conversation based on this history.` : 
    'This is a new conversation.';

  // Enhanced context combining with explicit visual content preservation and conversation memory
  const contextParts = [
    finalSystemPrompt,
    contextPrompt,
    qryptoKnowledgeContext || '',
    generalKnowledgeContext
  ];

  // Add conversation memory if available
  if (conversationMemory && conversationMemory.trim()) {
    contextParts.push(`\n### Conversation Memory\n${conversationMemory}`);
    console.log('🧠 Added conversation memory to system prompt');
  }

  // Add persona context if available
  if (contextualPrompt && !personaContext?.isAnonymous) {
    contextParts.push(`\n### User Context\n${contextualPrompt}`);
    console.log('🔧 Added persona context to system prompt');
  }

  // Add final reminder for visual content
  if (qryptoKnowledgeContext && (qryptoKnowledgeContext.includes('mermaid') || qryptoKnowledgeContext.includes('![') || qryptoKnowledgeContext.includes('MERMAID'))) {
    contextParts.push(`
### FINAL REMINDER
The knowledge base contains visual content (mermaid diagrams and/or images). You MUST include ALL visual content in your response exactly as provided in the knowledge base. Do not summarize or omit any mermaid diagrams, images, or visual guides.
`);
    console.log('🎨 Added visual content preservation reminder to system prompt');
  }

  const fullContext = contextParts.filter(Boolean).join('\n\n');

  // Configure model and parameters based on provider
  let modelConfig;
  let veniceParameters = {};
  
  if (useVenice) {
    const selectedModel = selectVeniceModel(message);
    console.log(`🎯 Venice: Selected model "${selectedModel}" based on query type`);
    
    modelConfig = {
      model: selectedModel,
      temperature: 0.8,
      max_tokens: 2000,
      top_p: 0.9,
      frequency_penalty: 0.1,
      presence_penalty: 0.1
    };
    
    // Add Venice-specific parameters
    veniceParameters = {
      venice_parameters: {
        include_venice_system_prompt: false, // Use our custom system prompt
        enable_web_search: "auto" // Enable web search when beneficial
      }
    };
  } else {
    modelConfig = {
      model: "gpt-4o-mini",
      temperature: 0.7,
      max_tokens: 1500
    };
  }

  console.log(`🚀 ${useVenice ? 'Venice' : 'OpenAI'}: Making API call with model: ${modelConfig.model}`);
  
  try {
    const requestBody = {
      ...modelConfig,
      ...veniceParameters,
      messages: [
        { 
          role: "system", 
          content: fullContext
        },
        { 
          role: "user", 
          content: message 
        }
      ],
    };
    
    console.log(`🔧 ${useVenice ? 'Venice' : 'OpenAI'}: Request config:`, {
      model: requestBody.model,
      hasVeniceParams: !!requestBody.venice_parameters,
      messageCount: requestBody.messages.length,
      hasPersonaContext: !personaContext?.isAnonymous,
      hasMetaKnytsContext: !!qryptoKnowledgeContext,
      hasConversationMemory: !!conversationMemory,
      hasVisualContent: qryptoKnowledgeContext?.includes('mermaid') || qryptoKnowledgeContext?.includes('![')
    });

    const response = await client.chat.completions.create(requestBody);

    console.log(`✅ ${useVenice ? 'Venice' : 'OpenAI'}: Response received successfully`);

    return response.choices[0]?.message?.content || "I apologize, I wasn't able to process your request.";
    
  } catch (error) {
    console.error(`❌ ${useVenice ? 'Venice' : 'OpenAI'}: API Error:`, {
      message: error.message,
      status: error.status,
      code: error.code,
      type: error.type
    });
    
    if (useVenice) {
      console.log('🔄 Venice: Attempting fallback to OpenAI due to Venice error');
      // Fallback to OpenAI if Venice fails
      return await processWithOpenAI(
        message, 
        knowledgeItems, 
        conversationId, 
        historicalContext,
        systemPrompt,
        qryptoKnowledgeContext,
        conversationMemory,
        false, // Use OpenAI as fallback
        personaContext,
        contextualPrompt
      );
    }
    
    throw error;
  }
}

/**
 * Enhanced detection for mermaid diagrams and visual content
 */
function detectMermaidDiagram(content: string): boolean {
  return content.includes("```mermaid");
}

function detectVisualContent(content: string): boolean {
  return content.includes("```mermaid") || content.includes("![") || content.includes("<img");
}

/**
 * Process a user message and generate a response with persona context, metaKnyts knowledge, and conversation memory
 */
async function processMonDAIInteraction(
  message: string, 
  conversationId: string | null,
  knowledgeItems: KnowledgeItem[] = [],
  historicalContext?: string,
  systemPrompt?: string,
  qryptoKnowledgeContext?: string,
  conversationMemory?: string,
  useVenice: boolean = false,
  personaContext?: any,
  contextualPrompt?: string
): Promise<MonDAIResponse> {
  // Generate a new conversation ID if none provided
  if (!conversationId) {
    conversationId = crypto.randomUUID();
  }
  
  console.log(`🔄 MonDAI Edge Function: Processing with ${useVenice ? 'Venice AI (uncensored)' : 'OpenAI'}`);
  if (personaContext && !personaContext.isAnonymous) {
    console.log(`🧠 MonDAI Edge Function: Using persona context for ${personaContext.preferredName || 'user'}`);
  }
  
  if (qryptoKnowledgeContext) {
    console.log(`📚 MonDAI Edge Function: Using metaKnyts knowledge context`);
  }

  if (conversationMemory) {
    console.log(`🧠 MonDAI Edge Function: Using conversation memory`);
  }
  
  // Process with the AI API (OpenAI or Venice) including persona context, metaKnyts knowledge, and conversation memory
  const aiResponse = await processWithOpenAI(
    message, 
    knowledgeItems, 
    conversationId, 
    historicalContext,
    systemPrompt,
    qryptoKnowledgeContext,
    conversationMemory,
    useVenice,
    personaContext,
    contextualPrompt
  );
  
  // Detect if response contains a mermaid diagram
  const mermaidDiagramIncluded = detectMermaidDiagram(aiResponse);
  
  // Determine if response might benefit from visuals
  const visualsProvided = mermaidDiagramIncluded || message.toLowerCase().includes('diagram');
  
  const modelUsed = useVenice ? selectVeniceModel(message) : "gpt-4o-mini";
  const aiProvider = useVenice ? "Venice AI (Uncensored)" : "OpenAI";
  
  // Determine knowledge source
  let knowledgeSource = "General Knowledge";
  if (qryptoKnowledgeContext && knowledgeItems.length > 0) {
    knowledgeSource = "metaKnyts Knowledge Base + KBAI Knowledge Base";
  } else if (qryptoKnowledgeContext) {
    knowledgeSource = "metaKnyts Knowledge Base";
  } else if (knowledgeItems.length > 0) {
    knowledgeSource = "KBAI Knowledge Base";
  }

  // Add conversation memory to knowledge source if used
  if (conversationMemory) {
    knowledgeSource += " + Conversation Memory";
  }
  
  return {
    conversationId,
    message: aiResponse,
    timestamp: new Date().toISOString(),
    metadata: {
      version: "1.0",
      modelUsed,
      knowledgeSource,
      itemsFound: knowledgeItems.length,
      visualsProvided,
      mermaidDiagramIncluded,
      conversationMemoryUsed: !!conversationMemory,
      isOffline: false,
      aiProvider,
      personaContextUsed: personaContext && !personaContext.isAnonymous,
      preferredName: personaContext?.preferredName,
      metaKnytsContextUsed: !!qryptoKnowledgeContext
    }
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 204,
      headers: corsHeaders 
    });
  }
  
  try {
    const { 
      message, 
      conversationId, 
      knowledgeItems, 
      historicalContext,
      systemPrompt,
      qryptoKnowledgeContext,
      conversationMemory,
      useVenice = false,
      personaContext,
      contextualPrompt
    } = await req.json();

    console.log(`🚀 MonDAI Edge Function: Received request with Venice: ${useVenice}`);
    console.log(`🔧 MonDAI Edge Function: useVenice parameter type:`, typeof useVenice, 'value:', useVenice);

    if (!message) {
      return new Response(
        JSON.stringify({
          error: 'No message provided'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Process the message with enhanced context and AI provider selection
    const response = await processMonDAIInteraction(
      message, 
      conversationId, 
      knowledgeItems || [],
      historicalContext,
      systemPrompt,
      qryptoKnowledgeContext,
      conversationMemory,
      useVenice,
      personaContext,
      contextualPrompt
    );

    console.log(`✅ MonDAI Edge Function: Response generated using ${response.metadata.aiProvider}`);

    return new Response(
      JSON.stringify(response),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in mondai-ai function:', error);
    
    return new Response(
      JSON.stringify({
        error: 'Error processing request',
        message: error instanceof Error ? error.message : String(error),
        details: error instanceof Error ? {
          name: error.name,
          stack: error.stack
        } : undefined
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
