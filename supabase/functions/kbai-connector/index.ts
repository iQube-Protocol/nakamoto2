
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

// KBAI MCP server endpoint
const KBAI_MCP_ENDPOINT = 'https://api.kbai.org/MCP/sse';

// Fetch KBAI secrets from environment variables
const KBAI_AUTH_TOKEN = Deno.env.get('KBAI_AUTH_TOKEN') || 'test-auth-token';
const KBAI_KB_TOKEN = Deno.env.get('KBAI_KB_TOKEN') || 'test-kb-token';

// Mock knowledge items for development without actual KBAI connection
const mockKnowledgeItems = [
  {
    id: 'kb-001',
    title: 'Blockchain Fundamentals',
    content: 'A blockchain is a distributed database that maintains a continuously growing list of records.',
    type: 'concept',
    source: 'KBAI',
    relevance: 0.95
  },
  {
    id: 'kb-002',
    title: 'Smart Contract Security',
    content: 'Smart contract security involves identifying and fixing vulnerabilities in blockchain-based contracts.',
    type: 'guide',
    source: 'KBAI',
    relevance: 0.9
  }
];

// Handle KBAI knowledge retrieval
async function fetchKBAIKnowledge(options: any) {
  try {
    console.log('Fetching knowledge from KBAI with options:', options);
    
    // Use mockKnowledgeItems for now instead of actual KBAI connection
    // In production, this would connect to the KBAI MCP server
    // This avoids exposing secrets in frontend code
    
    return {
      status: 200,
      items: mockKnowledgeItems,
      metadata: {
        source: 'KBAI MCP (mock)',
        timestamp: new Date().toISOString()
      }
    };
    
    // TODO: Implement actual KBAI connection when ready
    /*
    const response = await fetch(KBAI_MCP_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': KBAI_AUTH_TOKEN,
        'x-kb-token': KBAI_KB_TOKEN
      },
      body: JSON.stringify(options)
    });
    
    // Process SSE response
    const reader = response.body?.getReader();
    if (!reader) throw new Error('Failed to get response reader');
    
    const decoder = new TextDecoder();
    let result = '';
    
    const { value, done } = await reader.read();
    if (done) {
      throw new Error('Response ended prematurely');
    }
    
    result += decoder.decode(value);
    
    // Process and return the knowledge data
    const knowledgeData = JSON.parse(result);
    return knowledgeData;
    */
  } catch (error) {
    console.error('Error fetching KBAI knowledge:', error);
    
    return {
      status: 500,
      error: `Failed to connect to KBAI: ${error.message || 'Unknown error'}`,
      items: []
    };
  }
}

// Main Supabase Edge Function handler
serve(async (req) => {
  // Handle CORS for preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  try {
    // Parse the request body
    const { options } = await req.json();
    
    // Fetch knowledge from KBAI
    const result = await fetchKBAIKnowledge(options);
    
    // Return the result
    return new Response(
      JSON.stringify(result),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Error in kbai-connector:', error);
    
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
