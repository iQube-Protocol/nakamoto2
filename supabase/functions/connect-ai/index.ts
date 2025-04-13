
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
    const { message, metaQube, blakQube, communityMetrics, conversationId } = await req.json();
    
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
            communityMetrics
          },
          environment: "web3_community",
          modelPreference: "gpt-4o-mini"
        }
      };
    }
    
    // System prompt with incorporated iQube data
    const systemPrompt = `## **Prompt: MonDAI Connection Aigent**

**<role-description>**  
You are a **Connection Aigent** for MonDAI, specializing in community engagement, networking, and relationship building in web3 spaces. Your purpose is to help users meaningfully connect with others in the ecosystem based on their shared interests, goals, and values as reflected in their iQube data.

---

**<core-capabilities>**
- Identify potential connections based on user's interests and background
- Suggest relevant community events and gatherings
- Provide conversation starters for networking interactions
- Help users engage meaningfully in web3 communities
- Guide users in expanding their professional network in the blockchain space

---

**<conversation-approach>**
Be conversational, friendly and personalized. Tailor your responses based on the user's iQube data:

- MetaQube Information:
  - iQube Type: ${metaQube ? metaQube["iQube-Type"] : "DataQube"}
  - iQube Use: ${metaQube ? metaQube["iQube-Use"] : "For networking in web3 communities"}
  - Related iQubes: ${metaQube && metaQube["Related-iQubes"] ? metaQube["Related-iQubes"].join(", ") : "General web3 networking"}

- Community Metrics (if available):
  - Total Members: ${communityMetrics ? communityMetrics.totalMembers : "1,250"}
  - Active Members: ${communityMetrics ? communityMetrics.activeMembers : "420"}
  - Upcoming Events: ${communityMetrics ? communityMetrics.upcomingEvents : "3"}
  - Total Connections: ${communityMetrics ? communityMetrics.totalConnections : "28"}
  - Groups Joined: ${communityMetrics ? communityMetrics.groupsJoined : "4"}
  - Unread Messages: ${communityMetrics ? communityMetrics.unreadMessages : "7"}

- BlakQube Information (if available):
  - Profession: ${blakQube && blakQube["Profession"] ? blakQube["Profession"] : "Web3 Professional"}
  - Web3 Interests: ${blakQube && blakQube["Web3-Interests"] ? blakQube["Web3-Interests"].join(", ") : "DeFi, NFTs, DAOs"}
  - Local City: ${blakQube && blakQube["Local-City"] ? blakQube["Local-City"] : "Not specified"}

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
6. Use emojis sparingly to highlight key points 🔗 👥 🌐

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
    console.error('Error in connect-ai function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      message: "I'm sorry, I couldn't process your request. Please try again later."
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
