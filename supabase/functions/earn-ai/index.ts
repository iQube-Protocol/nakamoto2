
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Define MCP context structure
interface MCPContext {
  conversationId: string;
  messages: Array<{
    role: string;
    content: string;
    timestamp: string;
  }>;
  metadata: {
    userProfile: Record<string, any>;
    environment: string;
    modelPreference?: string;
  };
}

// Initialize a conversation store (in-memory for now, would use a database in production)
const conversationStore = new Map<string, MCPContext>();

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, metaQube, blakQube, tokenMetrics, conversationId } = await req.json();
    
    // Initialize or retrieve MCP context
    let mcpContext: MCPContext;
    
    if (conversationId && conversationStore.has(conversationId)) {
      mcpContext = conversationStore.get(conversationId)!;
      // Add user message to context
      mcpContext.messages.push({
        role: 'user',
        content: message,
        timestamp: new Date().toISOString()
      });
    } else {
      // Create new conversation context
      const newConversationId = crypto.randomUUID();
      mcpContext = {
        conversationId: newConversationId,
        messages: [{
          role: 'user',
          content: message,
          timestamp: new Date().toISOString()
        }],
        metadata: {
          userProfile: {
            metaQube,
            blakQube,
            tokenMetrics
          },
          environment: "defi_tokens",
          modelPreference: "gpt-4o-mini"
        }
      };
    }
    
    // System prompt with incorporated iQube data
    const systemPrompt = `## **Prompt: MonDAI Earning Aigent**

**<role-description>**  
You are an **Earning Aigent** for MonDAI, specializing in token economics, DeFi opportunities, and personal finance in the web3 ecosystem. Your purpose is to help users understand and maximize their earning potential with MonDAI tokens and related web3 assets based on their individual iQube data.

---

**<core-capabilities>**
- Explain MonDAI tokenomics, utility, and value proposition in simple terms
- Provide personalized earning strategies based on user's profile and risk tolerance
- Offer insights on token price movements and market trends
- Guide users to relevant staking, yield farming, or liquidity providing opportunities
- Help users understand their portfolio performance and potential optimizations

---

**<conversation-approach>**
Be conversational, friendly and personalized. Tailor your responses based on the user's iQube data:

- MetaQube Information:
  - iQube Type: ${metaQube ? metaQube["iQube-Type"] : "DataQube"}
  - iQube Use: ${metaQube ? metaQube["iQube-Use"] : "For earning in web3 communities"}
  - Related iQubes: ${metaQube && metaQube["Related-iQubes"] ? metaQube["Related-iQubes"].join(", ") : "General web3 earning"}

- Token Metrics (if available):
  - Price: ${tokenMetrics ? tokenMetrics.price : "0.50"} USD
  - Market Cap: ${tokenMetrics ? tokenMetrics.marketCap : "5,000,000"} USD
  - 24h Volume: ${tokenMetrics ? tokenMetrics.volume24h : "750,000"} USD
  - Price Change (24h): ${tokenMetrics ? tokenMetrics.priceChange24h : "3.5"}%

- BlakQube Information (if available):
  - Web3 Interests: ${blakQube && blakQube["Web3-Interests"] ? blakQube["Web3-Interests"].join(", ") : "DeFi, NFTs, DAOs"}
  - Tokens of Interest: ${blakQube && blakQube["Tokens-of-Interest"] ? blakQube["Tokens-of-Interest"].join(", ") : "ETH, BTC, SOL"}

---

**<formatting-guidelines>**
Format your responses to be visually appealing and easy to consume:

1. Use clear headings (# for main headings, ## for subheadings)
2. Use bullet points or numbered lists for multiple items
3. Highlight important information using **bold** or *italics*
4. Use markdown code blocks for examples:
   \`\`\`
   example code or data
   \`\`\`
5. Break complex topics into smaller, digestible sections
6. Use emojis sparingly to highlight key points ✅ 💰 📈

Keep your responses conversational but informative, focusing on being helpful without overwhelming the user with jargon.`;

    // Convert MCP context to OpenAI message format
    const formattedMessages = [
      { role: 'system', content: systemPrompt }
    ];
    
    // Add conversation history (limit to last 10 messages for token constraints)
    const recentMessages = mcpContext.messages.slice(-10);
    recentMessages.forEach(msg => {
      formattedMessages.push({ role: msg.role, content: msg.content });
    });

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: mcpContext.metadata.modelPreference || 'gpt-4o-mini',
        messages: formattedMessages,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    // Add AI response to context
    mcpContext.messages.push({
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date().toISOString()
    });
    
    // Store updated context
    conversationStore.set(mcpContext.conversationId, mcpContext);
    
    // Log context state (helpful for debugging)
    console.log(`Conversation ${mcpContext.conversationId} updated, now has ${mcpContext.messages.length} messages`);
    
    // Return the AI response with MCP metadata
    return new Response(JSON.stringify({ 
      message: aiResponse,
      timestamp: new Date().toISOString(),
      conversationId: mcpContext.conversationId,
      contextSize: mcpContext.messages.length,
      mcp: {
        version: "1.0",
        contextRetained: true,
        modelUsed: mcpContext.metadata.modelPreference
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Error in earn-ai function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      message: "I'm sorry, I couldn't process your request. Please try again later."
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
