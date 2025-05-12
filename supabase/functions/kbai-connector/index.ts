
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

// KBAI MCP server endpoint
const KBAI_MCP_ENDPOINT = 'https://api.kbai.org/MCP/sse';

// Use the provided authentication tokens
const KBAI_AUTH_TOKEN = '85abed95769d4b2ea1cb6bfaa8a67193';
const KBAI_KB_TOKEN = 'KB00000001_CRPTMONDS';

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

// Test if the KBAI server is accessible
async function testKBAIServerConnection() {
  try {
    console.log('Testing connection to KBAI MCP server...');
    
    const testResponse = await fetch(KBAI_MCP_ENDPOINT, {
      method: 'HEAD',
      headers: {
        'x-auth-token': KBAI_AUTH_TOKEN,
        'x-kb-token': KBAI_KB_TOKEN
      }
    });
    
    console.log(`KBAI server connection test status: ${testResponse.status}`);
    return testResponse.ok;
  } catch (error) {
    console.error('KBAI server connection test failed:', error);
    return false;
  }
}

// Handle KBAI knowledge retrieval with improved SSE handling and retries
async function fetchKBAIKnowledge(options: any) {
  try {
    console.log('Fetching knowledge from KBAI with options:', JSON.stringify(options));
    
    // Try to connect to the actual KBAI MCP server with the provided tokens
    try {
      // First test connection to KBAI server
      const isServerAccessible = await testKBAIServerConnection();
      if (!isServerAccessible) {
        console.warn('KBAI server is not accessible, using mock data');
        throw new Error('KBAI server is not accessible');
      }
      
      // Make the actual request to KBAI
      const response = await fetch(KBAI_MCP_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': KBAI_AUTH_TOKEN,
          'x-kb-token': KBAI_KB_TOKEN,
          // Add request correlation ID for debugging
          'x-request-id': crypto.randomUUID()
        },
        body: JSON.stringify(options)
      });
      
      if (!response.ok) {
        console.error(`KBAI server returned status ${response.status}:`, await response.text());
        throw new Error(`KBAI server returned status ${response.status}`);
      }
      
      // Process SSE response with improved handling
      const reader = response.body?.getReader();
      if (!reader) throw new Error('Failed to get response reader');
      
      const decoder = new TextDecoder();
      let result = '';
      let done = false;
      
      // Read the entire stream instead of just one chunk
      while (!done) {
        const { value, done: streamDone } = await reader.read();
        done = streamDone;
        
        if (value) {
          result += decoder.decode(value, { stream: !done });
        }
        
        if (done) break;
      }
      
      console.log('Successfully read SSE response from KBAI server');
      
      // Process and return the knowledge data
      try {
        const knowledgeData = JSON.parse(result);
        return {
          status: 200,
          items: knowledgeData.items || [],
          metadata: {
            source: 'KBAI MCP',
            timestamp: new Date().toISOString(),
            requestId: knowledgeData.requestId || null
          }
        };
      } catch (parseError) {
        console.error('Error parsing KBAI response:', parseError, 'Raw response:', result);
        throw new Error(`Failed to parse KBAI response: ${parseError.message}`);
      }
    } catch (error) {
      console.warn('Failed to connect to KBAI server, using mock data:', error);
      
      // Fall back to mock data if connection fails
      return {
        status: 200,
        items: mockKnowledgeItems,
        metadata: {
          source: 'KBAI MCP (mock)',
          timestamp: new Date().toISOString(),
          error: error.message
        }
      };
    }
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
    
    // Log request info for debugging
    console.log(`KBAI connector request received at ${new Date().toISOString()}`, 
      { options, headers: Object.fromEntries([...req.headers].filter(h => !h[0].includes('auth'))) });
    
    // Fetch knowledge from KBAI
    const result = await fetchKBAIKnowledge(options);
    
    // Log response summary
    console.log('KBAI connector response summary:', { 
      status: result.status, 
      itemCount: result.items?.length || 0, 
      hasError: !!result.error 
    });
    
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
        error: `Internal server error: ${error.message || 'Unknown error'}`,
        items: mockKnowledgeItems, // Still return mock items on error
        metadata: {
          source: 'KBAI MCP (error fallback)',
          timestamp: new Date().toISOString()
        }
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
