
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

// Create a simple service directly in the file instead of importing from src
async function processMonDAIInteraction(message: string, conversationId: string | null) {
  try {
    // Validate input
    if (!message || typeof message !== 'string') {
      return {
        error: 'Invalid message format',
        status: 400
      };
    }

    // Log basic request info
    console.log(`Processing MonDAI request for conversation: ${conversationId || 'new'}`);
    console.log(`Message length: ${message.length} chars`);
    
    // Process any document context 
    let documentContext = [];
    
    // Simulate AI processing
    const response = {
      id: `msg-${Date.now()}`,
      response: `I'm MonDAI, and I've processed your message: "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"`,
      conversationId: conversationId || `conv-${Date.now()}`,
      documentsUsed: documentContext.length > 0,
      sources: []
    };
    
    // Log response (excluding full content for brevity)
    console.log(`Generated response for ${conversationId}, length: ${response.response.length}`);
    console.log(`Documents used: ${response.documentsUsed}`);
    
    return response;
  } catch (error) {
    console.error('Error in processMonDAIInteraction:', error);
    return {
      error: 'Error processing message',
      message: error instanceof Error ? error.message : String(error),
      status: 500
    };
  }
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

    // Process the message using the function defined in this file
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
