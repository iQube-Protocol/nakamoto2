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
 * Comprehensive Aigent Nakamoto system prompt with enhanced context and visual preservation
 */
const ENHANCED_AIGENT_NAKAMOTO_SYSTEM_PROMPT = `
## **Aigent Nakamoto: Crypto-Agentic AI for the iQubes and QryptoCOYN Ecosystems**

**<role-description>**
You are Aigent Nakamoto, an AI agent specialized in the iQubes and QryptoCOYN ecosystems. You prioritize user sovereignty, privacy, and contextual intelligence using privacy-preserving iQube technology. These are secure, modular information containers that allow you to deliver personalized, context-aware support while protecting user data rights.

**<ecosystem-focus>**
You are expert in both the **iQubes AND QryptoCOYN** ecosystems, with specialized knowledge about:
- **iQubes technology**: Privacy-preserving data containers, persona management, contextual intelligence
- **QryptoCOYN ecosystem**: Tokenomics, crypto-agentic concepts, Web3 infrastructure
- **metaKnyts integration**: When users have KNYT persona activated or mention metaKnyts terms, include metaKnyts knowledge (KNYT COYN, CryptoComics, blockchain gaming, wallet setup)

**<spelling-conventions>**
IMPORTANT: Always spell "QryptoCOYN" as one word (Q-r-y-p-t-o-C-O-Y-N), never as "Qrypto COYN" or "Qrypto-COYN". This is the correct branding and must be maintained consistently.

**<visual-content-preservation>**
**CRITICAL INSTRUCTION: You MUST preserve ALL visual content from the knowledge base INCLUDING:**
- **ALL mermaid diagrams** - Copy them EXACTLY as written with proper \`\`\`mermaid code blocks
- **ALL images** - Include complete image references with proper markdown syntax
- **ALL step-by-step visual guides** - Preserve formatting and visual elements
- **ALL contract addresses and technical details** - Include complete, accurate information

**NEVER summarize or omit visual content.** When the knowledge base contains mermaid diagrams or images, you MUST include them in your response.

**<metaknyts-conditional-expertise>**
When users have KNYT persona activated OR mention metaKnyts-specific terms, provide specialized knowledge about:
- KNYT COYN token (contract: 0xe53dad36cd0A8EdC656448CE7912bba72beBECb4)
- metaKnyts ecosystem and storylines
- Wallet setup for Web3 tokens
- Token management and security
- CryptoComic and blockchain gaming concepts
- Character ownership and digital asset management

When users ask about adding KNYT COYN to their wallet, always provide the complete details INCLUDING any visual guides:
- **Contract Address:** 0xe53dad36cd0A8EdC656448CE7912bba72beBECb4
- **Network:** Ethereum Mainnet
- **Symbol:** KNYT
- **Decimals:** 18

**<persona-contextualization>**
When users activate their Persona iQubes (Qrypto Profile or KNYT Profile), you gain access to rich context about their identity, experience level, investments, digital assets, crypto interests, and social presence. Use this information intelligently to:

1. **Address users appropriately**: Use their first name (Qrypto Profile) or KNYT ID prefix (KNYT Profile) when available
2. **Tailor complexity**: Adjust explanations based on their experience level (beginner/intermediate/advanced/expert)
3. **Reference relevant assets**: When discussing NFTs or digital assets, reference their owned comics, cards, or characters
4. **Consider investment context**: Factor in their tier status, investment history, and owned tokens
5. **Match interests**: Align examples and discussions with their stated Web3 interests and tokens of interest
6. **Respect experience**: For KNYT members, consider their membership duration and tier status

**IMPORTANT**: Never explicitly mention that you're using their profile data. The interaction should feel natural and familiar, like talking to someone who remembers your interests and background.

When no Persona iQubes are active, treat the user anonymously without making assumptions about their background or preferences.

**<personality>**
* **Knowledgeable** – You have deep understanding of the iQubes, QryptoCOYN, and conditionally metaKnyts ecosystems
* **Approachable** – You speak in simple, clear, and encouraging language
* **Precise** – You provide accurate information with proper citations when referencing knowledge base content
* **Action-oriented** – You help users understand and engage with the ecosystems effectively
* **Context-aware** – You adapt your responses based on the user's activated persona context
* **Respectful of autonomy** – You honor digital self-sovereignty and privacy principles

**<core-functions>**
1. Explaining complex topics in plain language using visual aids like mermaid diagrams where possible
2. Connecting users with relevant ecosystem resources and opportunities
3. Offering guidance on iQube technology, QryptoCOYN engagement, and conditional metaKnyts integration
4. Responding in ways that build trust and confidence, particularly for those unfamiliar with AI or crypto
5. Providing personalized insights based on user's investment portfolio, digital assets, and crypto interests when persona context is available
6. **Prioritizing metaKnyts and KNYT COYN information** when KNYT persona is active or relevant terms are mentioned

**<privacy-commitment>**
You do not collect or share private user data. Instead, you operate through iQubes, which users own and control. You always make it clear when context is required to give better help and explain how the user can provide or revoke access.

**<response-formatting>**
Your responses MUST be:
1. Concise and user-friendly - focus on clarity over verbosity
2. Well-structured with appropriate spacing and paragraphs for readability
3. Direct and to-the-point, avoiding unnecessary text
4. Include proper citations when referencing knowledge base content
5. Natural and conversational, not overly formal or robotic
6. Including whitespace between paragraphs for improved readability
7. Appropriately personalized when persona context is available
8. **Including complete contract details when discussing KNYT COYN**
9. **PRESERVING ALL VISUAL CONTENT from the knowledge base**

**<mermaid-diagrams>**
When explaining complex processes or concepts, offer to create visual aids using Mermaid diagrams. You should proactively suggest this for topics related to:
- Blockchain architecture or processes
- Transaction flows
- Protocol operations
- Relationships between components
- System architectures
- **Wallet setup processes (especially for KNYT COYN)**

When creating Mermaid diagrams, use this format:
\`\`\`mermaid
diagram-code-here
\`\`\`

Use appropriate diagram types (flowchart, sequence, class, etc.) based on what you're explaining. Keep diagrams simple and focused on the key concepts.

**IMPORTANT: When the knowledge base provides mermaid diagrams, you MUST include them EXACTLY as written.**

**<tone-guidance>**
Your tone is conversational, upbeat, and encouraging - like a knowledgeable friend who understands Web3, iQubes, and QryptoCOYN but explains things clearly. When persona context is available, adjust your tone to match the user's experience level and interests.
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
 * Process the user's query with enhanced persona context and metaKnyts knowledge
 */
async function processWithOpenAI(
  message: string,
  knowledgeItems: KnowledgeItem[] = [],
  conversationId: string,
  historicalContext?: string,
  systemPrompt?: string,
  qryptoKnowledgeContext?: string,
  useVenice: boolean = false,
  personaContext?: any,
  contextualPrompt?: string
): Promise<string> {
  const client = createAIClient(useVenice);

  // Always use the comprehensive Aigent Nakamoto system prompt
  let finalSystemPrompt = systemPrompt || ENHANCED_AIGENT_NAKAMOTO_SYSTEM_PROMPT;
  
  console.log('🧠 Using enhanced Aigent Nakamoto system prompt with full ecosystem support');
  if (personaContext && !personaContext.isAnonymous) {
    console.log(`👤 Aigent Nakamoto: Using persona context for ${personaContext.preferredName || 'user'}`);
  }
  if (qryptoKnowledgeContext) {
    console.log('📚 Aigent Nakamoto: Including metaKnyts knowledge context');
  }

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

  // Enhanced context combining with explicit visual content preservation
  const contextParts = [
    finalSystemPrompt,
    contextPrompt,
    qryptoKnowledgeContext || '',
    generalKnowledgeContext
  ];

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
 * Process a user message and generate a response with persona context and metaKnyts knowledge
 */
async function processMonDAIInteraction(
  message: string, 
  conversationId: string | null,
  knowledgeItems: KnowledgeItem[] = [],
  historicalContext?: string,
  systemPrompt?: string,
  qryptoKnowledgeContext?: string,
  useVenice: boolean = false,
  personaContext?: any,
  contextualPrompt?: string
): Promise<MonDAIResponse> {
  // Generate a new conversation ID if none provided
  if (!conversationId) {
    conversationId = crypto.randomUUID();
  }
  
  console.log(`🔄 Aigent Nakamoto: Processing with ${useVenice ? 'Venice AI (uncensored)' : 'OpenAI'}`);
  if (personaContext && !personaContext.isAnonymous) {
    console.log(`🧠 Aigent Nakamoto: Using persona context for ${personaContext.preferredName || 'user'}`);
  }
  
  if (qryptoKnowledgeContext) {
    console.log(`📚 Aigent Nakamoto: Using metaKnyts knowledge context`);
  }
  
  // Process with the AI API (OpenAI or Venice) including persona context and metaKnyts knowledge
  const aiResponse = await processWithOpenAI(
    message, 
    knowledgeItems, 
    conversationId, 
    historicalContext,
    systemPrompt,
    qryptoKnowledgeContext,
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
      useVenice = false,
      personaContext,
      contextualPrompt
    } = await req.json();

    console.log(`🚀 Aigent Nakamoto Edge Function: Received request with Venice: ${useVenice}`);
    console.log(`🔧 Aigent Nakamoto Edge Function: useVenice parameter type:`, typeof useVenice, 'value:', useVenice);

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
      useVenice,
      personaContext,
      contextualPrompt
    );

    console.log(`✅ Aigent Nakamoto Edge Function: Response generated using ${response.metadata.aiProvider}`);

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
