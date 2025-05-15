
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
    
    // Use a simple fetch with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout
    
    try {
      const healthEndpoint = endpoint.replace('/sse', '/health') || endpoint;
      
      const response = await fetch(healthEndpoint, {
        method: 'HEAD',
        headers,
        cache: 'no-cache',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      // If we get a response, the endpoint is reachable
      console.log(`Health check response: ${response.status}`);
      return response.ok || response.status === 200;
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.log('HEAD request failed:', fetchError);
      
      // Consider endpoints unreachable after timeout
      return false;
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

    // Use AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
      console.log('SSE request timed out after 3 seconds');
    }, 3000);

    try {
      // Use standard fetch with SSE processing
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          ...headers,
          'Accept': 'text/event-stream',
          'Cache-Control': 'no-cache'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

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

      // Set another timeout for the reading process
      const readTimeoutId = setTimeout(() => {
        reading = false;
        console.log('SSE reading timed out after 2 seconds');
        // If we have some results already, consider it successful
        if (results.length > 0) {
          console.log(`Got partial results (${results.length}) before timeout`);
        }
      }, 2000);

      while (reading) {
        const { done, value } = await reader.read();
        
        if (done) {
          clearTimeout(readTimeoutId);
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

        // If we got enough results, stop reading
        if (results.length >= limit) {
          clearTimeout(readTimeoutId);
          reading = false;
          break;
        }
      }

      console.log(`SSE connection successful, received ${results.length} items`);
      
      // Return whatever results we have, even if we timed out
      return results;
    } catch (error) {
      clearTimeout(timeoutId);
      
      // If aborted due to timeout, return a friendly error
      if (error.name === 'AbortError') {
        console.log('SSE connection was aborted due to timeout');
        throw new Error('Connection timed out');
      }
      
      throw error;
    }
  } catch (error) {
    console.error('SSE connection error:', error);
    throw error;
  }
};
