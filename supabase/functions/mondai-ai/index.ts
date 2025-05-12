
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

// Mock AI response generation
async function generateMonDAIResponse(message: string, userId: string, conversationId: string | null, historicalContext: string, knowledgeItems: any[] = []) {
  // In a real implementation, this would call a language model API
  // or use a local model to generate a response
  
  console.log(`Generating MonDAI response for user ${userId?.substring(0,8)}`);
  console.log(`Conversation ID: ${conversationId}`);
  console.log(`Message: ${message}`);
  console.log(`Knowledge items: ${knowledgeItems?.length || 0}`);
  
  // Simulate thinking time
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Use knowledge items in response generation if available
  let responseContent = '';
  
  if (message.toLowerCase().includes('knowledge') || message.toLowerCase().includes('kbai')) {
    responseContent = `I've accessed my knowledge base to provide you with information. The KBAI Model Context Protocol (MCP) integration allows me to retrieve specialized knowledge on Web3 topics.\n\nI currently have access to ${knowledgeItems?.length || 0} knowledge items that might be relevant to your question.`;
    
    if (knowledgeItems?.length > 0) {
      responseContent += `\n\nHere's what I found:\n\n${knowledgeItems[0].title}: ${knowledgeItems[0].content}`;
      
      if (knowledgeItems.length > 1) {
        responseContent += `\n\n${knowledgeItems[1].title}: ${knowledgeItems[1].content}`;
      }
    } else {
      responseContent += "\n\nCurrently, I don't have any specific knowledge items on this topic. You can try searching for something else in the Knowledge Base tab.";
    }
  } else if (message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi')) {
    responseContent = "Hello! I'm the MonDAI agent powered by the KBAI knowledge base integration. I can help you learn about Web3, blockchain technology, and cryptocurrency concepts. Feel free to ask me anything or explore the Knowledge Base tab to see what specialized information I have access to.";
  } else if (message.toLowerCase().includes('blockchain')) {
    responseContent = "Blockchain is a distributed ledger technology that enables secure, transparent, and immutable record-keeping without requiring a central authority. It's the foundation of most cryptocurrency systems like Bitcoin and Ethereum, and is increasingly being used for applications beyond finance, such as supply chain management, identity verification, and decentralized governance.";
  } else {
    responseContent = `I understand you're asking about: "${message}"\n\nI can provide information on various Web3 and blockchain topics. You can also explore the Knowledge Base tab to find more specialized information. What specific aspect would you like to learn about?`;
  }
  
  // Generate conversation ID if not provided
  const newConversationId = conversationId || crypto.randomUUID();
  
  return {
    conversationId: newConversationId,
    message: responseContent,
    timestamp: new Date().toISOString(),
    metadata: {
      version: "1.0",
      modelUsed: "gpt-4o",
      metisActive: true,
      knowledgeItemsUsed: knowledgeItems?.length || 0
    }
  };
}

// Main Supabase Edge Function handler
serve(async (req) => {
  // Handle CORS for preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  try {
    // Parse the request body
    const { message, userId, conversationId, historicalContext, knowledgeItems } = await req.json();
    
    if (!message) {
      throw new Error('Message is required');
    }
    
    // Generate response
    const response = await generateMonDAIResponse(
      message,
      userId,
      conversationId,
      historicalContext,
      knowledgeItems
    );
    
    // Return the result
    return new Response(
      JSON.stringify(response),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Error in mondai-ai:', error);
    
    return new Response(
      JSON.stringify({
        status: 500,
        error: `Internal server error: ${error.message || 'Unknown error'}`
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});
