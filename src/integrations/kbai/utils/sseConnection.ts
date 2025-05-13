
import { EventSourcePolyfill } from 'event-source-polyfill';
import { KBAIKnowledgeItem } from '../index';
import { toast } from 'sonner';

/**
 * Connect to the KBAI server using Server-Sent Events
 */
export interface SSEConnectionOptions {
  endpoint: string;
  headers: Record<string, string>;
  query?: string;
  limit?: number;
  category?: string;
  timeout?: number;
}

/**
 * Connect to an SSE endpoint and handle incoming knowledge items
 */
export async function connectToSSE(options: SSEConnectionOptions): Promise<KBAIKnowledgeItem[]> {
  return new Promise((resolve, reject) => {
    const { 
      endpoint, 
      headers, 
      query = '', 
      limit = 10, 
      category = '',
      timeout = 25000 // Increased to 25 seconds
    } = options;
    
    // Construct query string with parameters
    const params = new URLSearchParams();
    if (query) params.append('query', query);
    if (limit) params.append('limit', limit.toString());
    if (category) params.append('category', category);
    
    const fullEndpoint = `${endpoint}?${params.toString()}`;
    console.log('Connecting to SSE endpoint:', fullEndpoint);
    
    // Fix: Add Origin and mode headers for CORS
    const enhancedHeaders = {
      ...headers,
      'Origin': window.location.origin,
    };
    
    // Use EventSource polyfill to support custom headers
    const eventSource = new EventSourcePolyfill(fullEndpoint, {
      headers: enhancedHeaders,
      withCredentials: false, // Explicitly false for CORS
      heartbeatTimeout: 20000 // 20 seconds heartbeat timeout
    });
    
    const knowledgeItems: KBAIKnowledgeItem[] = [];
    const connectionTimeout = setTimeout(() => {
      if (eventSource.readyState !== eventSource.CLOSED) {
        console.log(`SSE connection timed out after ${timeout/1000}s, closing connection`);
        eventSource.close();
        
        // If we have at least some items, consider it a partial success
        if (knowledgeItems.length > 0) {
          console.log(`Returning ${knowledgeItems.length} partial results due to timeout`);
          resolve(knowledgeItems);
        } else {
          reject(new Error('SSE connection timed out without receiving any data'));
        }
      }
    }, timeout);
    
    // Set a shorter "initial data" timeout
    const initialDataTimeout = setTimeout(() => {
      if (knowledgeItems.length === 0 && eventSource.readyState !== eventSource.CLOSED) {
        console.log('No initial data received within 8s, closing connection');
        eventSource.close();
        reject(new Error('No initial data received'));
      }
    }, 8000);
    
    eventSource.onopen = (event) => {
      console.log('SSE connection opened successfully', event);
    };
    
    eventSource.onmessage = (event) => {
      try {
        // Clear the initial data timeout as soon as we get a message
        clearTimeout(initialDataTimeout);
        console.log('Received SSE event data:', event.data);
        
        let data;
        try {
          data = JSON.parse(event.data);
        } catch (parseError) {
          console.warn('Failed to parse SSE event as JSON, trying alternative formats', parseError);
          
          // Try alternative format - some SSE servers send data differently
          // Check if it's a string that needs further processing
          if (typeof event.data === 'string' && event.data.includes('{')) {
            const jsonStr = event.data.substring(event.data.indexOf('{'));
            try {
              data = JSON.parse(jsonStr);
            } catch (e) {
              console.error('Alternative parsing failed too:', e);
              // Continue with event loop, don't add this item
              return;
            }
          } else {
            // If we can't parse it at all, just continue
            return;
          }
        }
        
        // Transform raw data into KBAIKnowledgeItem
        const item = transformKnowledgeItem(data);
        knowledgeItems.push(item);
        
        // If we've reached the limit, close connection and resolve
        if (knowledgeItems.length >= limit) {
          console.log(`Received target number of items (${limit}), closing connection`);
          clearTimeout(connectionTimeout);
          clearTimeout(initialDataTimeout);
          eventSource.close();
          resolve(knowledgeItems);
        }
      } catch (error) {
        console.error('Error processing SSE message:', error);
      }
    };
    
    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      clearTimeout(connectionTimeout);
      clearTimeout(initialDataTimeout);
      eventSource.close();
      
      if (knowledgeItems.length > 0) {
        console.log(`SSE connection error, but returning ${knowledgeItems.length} items already received`);
        resolve(knowledgeItems); // Return partial results if available
      } else {
        reject(new Error('SSE connection failed - possible CORS issue'));
      }
    };
  });
}

/**
 * Transform raw knowledge item from KBAI format
 */
export function transformKnowledgeItem(item: any): KBAIKnowledgeItem {
  return {
    id: item.id || `kb-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    title: item.title || item.name || 'Untitled Knowledge Item',
    content: item.content || item.text || item.description || '',
    type: item.type || 'general',
    source: item.source || 'KBAI',
    relevance: item.relevance || item.score || 0.5,
    timestamp: item.timestamp || new Date().toISOString()  // Ensure timestamp is always set
  };
}

/**
 * Check the health of an API endpoint
 */
export async function checkApiHealth(
  endpoint: string, 
  headers: Record<string, string>
): Promise<boolean> {
  try {
    console.log('Checking API health for endpoint:', endpoint);
    
    // Enhanced headers for CORS
    const enhancedHeaders = {
      ...headers,
      'Origin': window.location.origin,
    };
    
    // Use a simpler GET request for health check with a timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    // First try the /health endpoint, but if that fails, try the main endpoint
    try {
      // Use fetch with no-cors mode as fallback if regular fails
      const healthResponse = await fetch(`${endpoint}/health`, {
        method: 'GET',
        headers: enhancedHeaders,
        signal: controller.signal,
        mode: 'cors', // Try standard CORS first
      });
      
      clearTimeout(timeoutId);
      
      if (healthResponse.ok) {
        console.log('Health endpoint check successful');
        return true;
      }
      
      console.log('Health endpoint check failed, trying main endpoint');
    } catch (healthError) {
      console.log('Health endpoint error, falling back to main endpoint check:', healthError);
      // Continue to try the main endpoint
    }
    
    // If health endpoint fails, try a HEAD request to the main endpoint
    const mainController = new AbortController();
    const mainTimeoutId = setTimeout(() => mainController.abort(), 5000);
    
    try {
      // First try with standard CORS mode
      const response = await fetch(endpoint, {
        method: 'HEAD',
        headers: enhancedHeaders,
        signal: mainController.signal,
        mode: 'cors',
      });
      
      clearTimeout(mainTimeoutId);
      
      const isHealthy = response.ok;
      console.log(`API main endpoint check: ${isHealthy ? 'Healthy' : 'Unhealthy'}`);
      
      return isHealthy;
    } catch (corsError) {
      console.warn('Standard CORS request failed, attempting with no-cors mode:', corsError);
      
      try {
        // Try with no-cors mode as a last resort
        // This won't give us response details but can verify the endpoint exists
        await fetch(endpoint, {
          method: 'HEAD',
          headers: enhancedHeaders,
          signal: mainController.signal,
          mode: 'no-cors', // Try no-cors mode
        });
        
        // If no exception is thrown with no-cors, consider it a partial success
        console.log('No-cors request completed, considering endpoint accessible');
        return true;
      } catch (noCorsError) {
        console.error('Both CORS and no-cors requests failed:', noCorsError);
        return false;
      }
    }
  } catch (error) {
    console.error('API health check failed:', error);
    
    // Add more detailed error logging
    if (error instanceof TypeError && error.message.includes('NetworkError')) {
      console.error('Network error when connecting to API. Possibly CORS related or server is unavailable.');
      toast.error('KBAI API connection failed', {
        description: 'CORS issue or API server is unavailable'
      });
    }
    
    return false;
  }
}
