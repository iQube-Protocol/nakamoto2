
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
 * MonDAI system prompt for conversational responses
 */
const MONDAI_SYSTEM_PROMPT = `
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
 * Default Aigent Nakamoto system prompt
 */
const DEFAULT_AIGENT_NAKAMOTO_SYSTEM_PROMPT = `
## **Aigent Nakamoto: Crypto-Agentic AI for the QryptoCOYN Ecosystem**

**<role-description>**
You are Aigent Nakamoto, an AI agent specialized in the QryptoCOYN ecosystem. You prioritize user sovereignty, privacy, and contextual intelligence using privacy-preserving iQube technology.

**<spelling-note>**
IMPORTANT: Always spell "QryptoCOYN" as one word (Q-r-y-p-t-o-C-O-Y-N), never as "Qrypto COYN" or "Qrypto-COYN". This is the correct branding and must be maintained consistently.

**<personality>**
* **Knowledgeable** – You have deep understanding of the QryptoCOYN ecosystem, tokenomics, and crypto-agentic concepts.
* **Approachable** – You speak in simple, clear, and encouraging language.
* **Precise** – You provide accurate information with proper citations when referencing knowledge base content.
* **Action-oriented** – You help users understand and engage with the QryptoCOYN ecosystem effectively.

**<response-formatting>**
Your responses MUST be:
1. Concise and user-friendly - focus on clarity over verbosity
2. Well-structured with appropriate spacing and paragraphs for readability
3. Direct and to-the-point, avoiding unnecessary text
4. Include proper citations when referencing knowledge base content
5. Natural and conversational, not overly formal or robotic

**<mermaid-diagrams>**
When explaining complex QryptoCOYN processes, offer to create visual aids using Mermaid diagrams:

\`\`\`mermaid
diagram-code-here
\`\`\`

**<tone-guidance>**
Your tone is conversational, upbeat, and encouraging - like a knowledgeable friend who understands Web3 and QryptoCOYN but explains things clearly.
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
    
    console.log('🔧 Venice: Creating Venice AI client with uncensored configuration');
    
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
 * Process the user's query with enhanced context and proper Venice configuration
 */
async function processWithOpenAI(
  message: string,
  knowledgeItems: KnowledgeItem[] = [],
  conversationId: string,
  historicalContext?: string,
  systemPrompt?: string,
  qryptoKnowledgeContext?: string,
  useVenice: boolean = false
): Promise<string> {
  const client = createAIClient(useVenice);

  // Use provided system prompt or default
  const finalSystemPrompt = systemPrompt || DEFAULT_AIGENT_NAKAMOTO_SYSTEM_PROMPT;

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

  // Combine all context
  const fullContext = [
    finalSystemPrompt,
    contextPrompt,
    qryptoKnowledgeContext || '',
    generalKnowledgeContext
  ].filter(Boolean).join('\n\n');

  // Configure model and parameters based on provider
  const modelConfig = useVenice ? {
    model: "llama-3-70b-instruct",  // Venice's available uncensored model
    temperature: 0.8,
    max_tokens: 2000,
    top_p: 0.9,
    frequency_penalty: 0.1,
    presence_penalty: 0.1
  } : {
    model: "gpt-4o-mini",
    temperature: 0.7,
    max_tokens: 1500
  };

  console.log(`🚀 ${useVenice ? 'Venice' : 'OpenAI'}: Making API call with model: ${modelConfig.model}`);

  const response = await client.chat.completions.create({
    ...modelConfig,
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
  });

  console.log(`✅ ${useVenice ? 'Venice' : 'OpenAI'}: Response received successfully`);

  return response.choices[0]?.message?.content || "I apologize, I wasn't able to process your request.";
}

/**
 * Detects if the response includes a mermaid diagram
 */
function detectMermaidDiagram(content: string): boolean {
  return content.includes("```mermaid");
}

/**
 * Process a user message and generate a response
 */
async function processMonDAIInteraction(
  message: string, 
  conversationId: string | null,
  knowledgeItems: KnowledgeItem[] = [],
  historicalContext?: string,
  systemPrompt?: string,
  qryptoKnowledgeContext?: string,
  useVenice: boolean = false
): Promise<MonDAIResponse> {
  // Generate a new conversation ID if none provided
  if (!conversationId) {
    conversationId = crypto.randomUUID();
  }
  
  console.log(`🔄 MonDAI Edge Function: Processing with ${useVenice ? 'Venice AI (uncensored)' : 'OpenAI'}`);
  
  // Process with the AI API (OpenAI or Venice)
  const aiResponse = await processWithOpenAI(
    message, 
    knowledgeItems, 
    conversationId, 
    historicalContext,
    systemPrompt,
    qryptoKnowledgeContext,
    useVenice
  );
  
  // Detect if response contains a mermaid diagram
  const mermaidDiagramIncluded = detectMermaidDiagram(aiResponse);
  
  // Determine if response might benefit from visuals
  const visualsProvided = mermaidDiagramIncluded || message.toLowerCase().includes('diagram');
  
  const modelUsed = useVenice ? "llama-3-70b-instruct" : "gpt-4o-mini";
  const aiProvider = useVenice ? "Venice AI (Uncensored)" : "OpenAI";
  
  return {
    conversationId,
    message: aiResponse,
    timestamp: new Date().toISOString(),
    metadata: {
      version: "1.0",
      modelUsed,
      knowledgeSource: qryptoKnowledgeContext ? "QryptoCOYN Knowledge Base + AI" : 
                      knowledgeItems.length > 0 ? "KBAI Knowledge Base" : "General Knowledge",
      itemsFound: knowledgeItems.length,
      visualsProvided,
      mermaidDiagramIncluded,
      isOffline: false,
      aiProvider
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
      useVenice = false
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
      useVenice
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
        message: error instanceof Error ? error.message : String(error)
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
