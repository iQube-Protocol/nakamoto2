
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

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

// Process a user message and generate a response
async function processMonDAIInteraction(
  message: string, 
  conversationId: string | null
): Promise<MonDAIResponse> {
  // Generate a new conversation ID if none provided
  if (!conversationId) {
    conversationId = crypto.randomUUID();
  }
  
  // In a real implementation, this would connect to the LLM and knowledge base
  // For now, let's provide a more conversational placeholder response
  let response = `I understand you're asking about "${message}". I'll provide a concise, user-friendly response based on my knowledge base.`;
  
  // Example detection of when diagrams might be helpful
  const diagramRelatedTerms = ['process', 'flow', 'how does', 'structure', 'architecture', 'diagram'];
  const mightBenefitFromDiagram = diagramRelatedTerms.some(term => 
    message.toLowerCase().includes(term)
  );
  
  let mermaidDiagramIncluded = false;
  
  // If the query might benefit from a diagram, include a sample one
  if (mightBenefitFromDiagram) {
    response += `\n\nHere's a visual representation that might help explain this:\n\n\`\`\`mermaid
graph TD
    A[User Question] --> B[Knowledge Processing]
    B --> C[Context Analysis]
    C --> D[Response Generation]
    D --> E[User-Friendly Answer]
    \`\`\``;
    mermaidDiagramIncluded = true;
  }
  
  // Add a helpful conclusion
  response += `\n\nIs there anything specific about this topic you'd like me to elaborate on?`;
  
  return {
    conversationId,
    message: response,
    timestamp: new Date().toISOString(),
    metadata: {
      version: "1.0",
      modelUsed: "gpt-4o",
      knowledgeSource: "Offline Knowledge Base",
      itemsFound: 3,
      visualsProvided: mightBenefitFromDiagram,
      mermaidDiagramIncluded,
      isOffline: true
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
    const { message, conversationId } = await req.json();

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

    // Process the message
    const response = await processMonDAIInteraction(message, conversationId);

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
