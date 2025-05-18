
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
 * Process the user's query with the OpenAI API
 * @param message User's message
 * @param knowledgeItems Relevant knowledge items
 * @param conversationId Conversation ID for continuity
 * @returns Processed response from the AI
 */
async function processWithOpenAI(
  message: string,
  knowledgeItems: KnowledgeItem[] = [],
  conversationId: string,
  historicalContext?: string
): Promise<string> {
  const openai = new OpenAI({
    apiKey: Deno.env.get('OPENAI_API_KEY') || '',
  });

  // Format knowledge items for the AI prompt
  let knowledgeContext = '';
  if (knowledgeItems && knowledgeItems.length > 0) {
    knowledgeContext = `
### Knowledge Base Entries
${knowledgeItems.map((item, index) => 
    `
[Entry ${index + 1}]
Title: ${item.title || 'Untitled'}
Content: ${item.content}
Type: ${item.type || 'General'}
`
).join('\n')}

Use the information above to inform your responses, summarize this knowledge - do not quote verbatim.
`;
  }

  // Include historical context if available
  const contextPrompt = historicalContext ? 
    `Previous conversation context:\n${historicalContext}\n\nContinue the conversation based on this history.` : 
    'This is a new conversation.';

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini", // Using gpt-4o-mini for cost efficiency, can be upgraded as needed
    messages: [
      { 
        role: "system", 
        content: `${MONDAI_SYSTEM_PROMPT}\n\n${contextPrompt}\n\n${knowledgeContext}` 
      },
      { 
        role: "user", 
        content: message 
      }
    ],
    temperature: 0.7,
    max_tokens: 1500,
  });

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
  historicalContext?: string
): Promise<MonDAIResponse> {
  // Generate a new conversation ID if none provided
  if (!conversationId) {
    conversationId = crypto.randomUUID();
  }
  
  // Process with the OpenAI API
  const aiResponse = await processWithOpenAI(message, knowledgeItems, conversationId, historicalContext);
  
  // Detect if response contains a mermaid diagram
  const mermaidDiagramIncluded = detectMermaidDiagram(aiResponse);
  
  // Determine if response might benefit from visuals
  const visualsProvided = mermaidDiagramIncluded || message.toLowerCase().includes('diagram');
  
  return {
    conversationId,
    message: aiResponse,
    timestamp: new Date().toISOString(),
    metadata: {
      version: "1.0",
      modelUsed: "gpt-4o-mini",
      knowledgeSource: knowledgeItems.length > 0 ? "KBAI Knowledge Base" : "General Knowledge",
      itemsFound: knowledgeItems.length,
      visualsProvided,
      mermaidDiagramIncluded,
      isOffline: false
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
    const { message, conversationId, knowledgeItems, historicalContext } = await req.json();

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

    // Process the message with the provided knowledge items (if any)
    const response = await processMonDAIInteraction(
      message, 
      conversationId, 
      knowledgeItems || [],
      historicalContext
    );

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
