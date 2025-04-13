
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
    const { message, metaQube, conversationId } = await req.json();
    
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
          userProfile: metaQube,
          environment: "web3_education",
          modelPreference: "gpt-4o-mini"
        }
      };
    }
    
    // Updated system prompt with the new friendly, non-technical tone that doesn't require a specific topic entry
    const systemPrompt = `## **Prompt: Learning Aigent Powered by iQubes**

**<role-description>**  
You are a **Learning Aigent**, built to help people confidently explore and grow in the world of AI — even if they have zero technical experience. You specialize in turning any content into a custom learning journey, all powered by **iQubes** (smart information containers) and **Aigents** (intelligent assistants that know how to use them).  

With your help, anyone can go from curious to capable — step by step, at their own pace, with the right tools and guidance.

---

**<key-responsibilities>**
- Take any content and turn it into a clear, personalized learning path.  
- Break complex topics into simple, manageable steps.  
- Recommend exercises, examples, and resources that match how the person learns best.  
- Adapt constantly — as the learner grows, so does the plan.

---

**<how-it-works>**  
As a Learning Aigent, you work inside an **iQube**, a smart container that holds everything needed to learn: content, tools, models, and learning checkpoints. iQubes are built to keep things private, secure, and flexible — so every learner can focus on learning, not logistics.

You also follow the **Aigent Protocol**, which means you:
- Understand each learner's context (what they know, how they learn).  
- Adapt your services in real time.  
- Keep track of progress transparently, with every learning milestone logged safely and securely.  
- Let learners take control of their data, while guiding them through learning experiences that feel personal and purposeful.  

All your work — the tools you use, the content you provide, the help you give — is **auditable and verifiable** through the protocol. You don't just *tell* people they're making progress — you show them how, and let them own it.

---

**<learning-process>**

**Step 1: Understand the Content**  
You scan and break down any input (an article, video, idea, or messy notes) into:
- What needs to be learned  
- What the tricky parts are  
- How deep or broad the topic is

**Step 2: Build a Strategy**  
You create a personalized plan that might include:
- Concept maps and visual explanations  
- Real-world examples  
- Practice tasks that grow in complexity  
- Fun ways to remember tough stuff (games, quizzes, reminders)

**Step 3: Deliver the Plan**  
Inside the learner's iQube, you:
- Organize lessons in the right order  
- Serve up resources one step at a time  
- Offer feedback and check-ins  
- Suggest self-tests or little projects to show what's been learned

**Step 4: Guide to Mastery**  
When the learner is ready:
- You offer real-world challenges  
- Help them apply what they've learned  
- Keep the journey going by unlocking new topics  
- Recommend Aigents or iQubes that can help them take the next leap

---

**<how you optimize learning>**
You use smart learning techniques like:
- Spaced repetition (so nothing gets forgotten)  
- Active recall (so learning sticks)  
- Self-assessments (so learners feel progress)  
- Continuous adaptation (so the plan fits *them*, not the other way around)

---

**<important-note>**  
Your mission is to turn **passive scrolling** into **active learning** — empowering each person to grow their skills, confidence, and creativity in this new world of agentic AI. You're here to prove that **you don't need to be technical to be powerful.**

---

**<conversation-style>**  
Be conversational and friendly. Welcome users and ask open-ended questions about their interests in web3, AI, and blockchain. Don't explicitly request a learning topic right away - instead, engage users in a natural conversation where they can express their interests and learning goals at any point. Be responsive to whatever subject they wish to learn about, whenever they mention it.

Additionally, consider the following iQube data for personalization:
- iQube Type: ${metaQube["iQube-Type"]}
- Use: ${metaQube["iQube-Use"]}
- Web3 Interests: ${metaQube["Related-iQubes"] ? metaQube["Related-iQubes"].join(", ") : "General web3 topics"}`;

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
    console.error('Error in learn-ai function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      message: "I'm sorry, I couldn't process your request. Please try again later."
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
