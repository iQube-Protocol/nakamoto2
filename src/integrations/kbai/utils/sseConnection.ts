
/**
 * Check if the API is healthy by testing a simple connection
 * @param endpoint The API endpoint to check
 * @param headers Authentication headers to use
 * @returns Whether the endpoint is healthy
 */
export const checkApiHealth = async (
  endpoint: string, 
  headers: Record<string, string>
): Promise<boolean> => {
  try {
    console.log(`Testing connection to ${endpoint}`);
    
    // First try: Simple fetch with no-cors mode to check if the server is reachable
    const healthEndpoint = endpoint.replace('/sse', '/health') || endpoint;
    
    try {
      const response = await fetch(healthEndpoint, {
        method: 'HEAD',
        mode: 'no-cors',
        headers,
        cache: 'no-cache'
      });
      
      // If we get here, at least the server responded
      console.log('Server responded to HEAD request');
      return true;
    } catch (fetchError) {
      console.log('HEAD request failed, trying websocket check');
      
      // Try using WebSocket as a fallback to check connectivity
      return new Promise((resolve) => {
        // Extract hostname and create WebSocket URL
        try {
          const url = new URL(endpoint);
          const wsUrl = `${url.protocol === 'https:' ? 'wss' : 'ws'}://${url.hostname}/health`;
          
          const ws = new WebSocket(wsUrl);
          
          // Set timeout to close connection after 2 seconds
          const timeout = setTimeout(() => {
            ws.close();
            console.log('WebSocket connection timed out');
            resolve(false);
          }, 2000);
          
          ws.onopen = () => {
            clearTimeout(timeout);
            ws.close();
            console.log('WebSocket connection successful');
            resolve(true);
          };
          
          ws.onerror = () => {
            clearTimeout(timeout);
            ws.close();
            console.log('WebSocket connection failed');
            resolve(false);
          };
        } catch (wsError) {
          console.log('WebSocket connection attempt failed', wsError);
          resolve(false);
        }
      });
    }
  } catch (error) {
    console.error('KBAI health check error:', error);
    return false;
  }
};

/**
 * Connect to the KBAI server using SSE (Server-Sent Events)
 * @param options Connection options
 * @returns Array of knowledge items
 */
export const connectToSSE = async (options: {
  endpoint: string;
  headers: Record<string, string>;
  query?: string;
  limit?: number;
}): Promise<any[]> => {
  try {
    const { endpoint, headers, query, limit = 10 } = options;
    console.log(`Connecting to SSE endpoint: ${endpoint}`);

    // Build URL with query parameters
    const url = new URL(endpoint);
    if (query) url.searchParams.append('query', query);
    if (limit) url.searchParams.append('limit', limit.toString());

    // Use standard fetch with SSE processing instead of EventSource
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        ...headers,
        'Accept': 'text/event-stream',
        'Cache-Control': 'no-cache'
      }
    });

    if (!response.ok) {
      throw new Error(`SSE connection failed: ${response.status} ${response.statusText}`);
    }

    if (!response.body) {
      throw new Error('Response body is null');
    }

    // Process SSE response
    const results: any[] = [];
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let reading = true;

    // Read 3 seconds maximum
    const timeoutId = setTimeout(() => {
      reading = false;
      console.log('SSE reading timed out after 3 seconds');
    }, 3000);

    while (reading) {
      const { done, value } = await reader.read();
      
      if (done) {
        clearTimeout(timeoutId);
        break;
      }

      // Append to buffer and process
      buffer += decoder.decode(value, { stream: true });
      
      // Process complete SSE messages
      const messages = buffer.split('\n\n');
      buffer = messages.pop() || ''; // Keep the last incomplete message in buffer

      for (const message of messages) {
        if (!message.trim()) continue;
        
        const lines = message.split('\n');
        const eventData = lines
          .filter(line => line.startsWith('data:'))
          .map(line => line.slice(5).trim())
          .join('');

        if (eventData) {
          try {
            const data = JSON.parse(eventData);
            if (Array.isArray(data)) {
              results.push(...data);
            } else {
              results.push(data);
            }
          } catch (e) {
            console.error('Failed to parse SSE data', eventData);
          }
        }
      }

      // If we got enough results or we've been reading too long
      if (results.length >= limit) {
        clearTimeout(timeoutId);
        reading = false;
        break;
      }
    }

    console.log(`SSE connection successful, received ${results.length} items`);
    return results;
  } catch (error) {
    console.error('SSE connection error:', error);
    throw error;
  }
};
