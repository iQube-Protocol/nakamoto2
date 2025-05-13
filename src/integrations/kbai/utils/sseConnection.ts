
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
}

/**
 * Connect to an SSE endpoint and handle incoming knowledge items
 */
export async function connectToSSE(options: SSEConnectionOptions): Promise<KBAIKnowledgeItem[]> {
  return new Promise((resolve, reject) => {
    const { endpoint, headers, query = '', limit = 10, category = '' } = options;
    
    // Construct query string with parameters
    const params = new URLSearchParams();
    if (query) params.append('query', query);
    if (limit) params.append('limit', limit.toString());
    if (category) params.append('category', category);
    
    const fullEndpoint = `${endpoint}?${params.toString()}`;
    console.log('Connecting to SSE endpoint:', fullEndpoint);
    
    // Use EventSource polyfill to support custom headers
    const eventSource = new EventSourcePolyfill(fullEndpoint, {
      headers,
      withCredentials: false, // Setting this explicitly to false for CORS
      heartbeatTimeout: 10000 // 10 seconds heartbeat timeout
    });
    
    const knowledgeItems: KBAIKnowledgeItem[] = [];
    const timeout = setTimeout(() => {
      if (eventSource.readyState !== eventSource.CLOSED) {
        console.log('SSE connection timed out after 15s, closing connection');
        eventSource.close();
        resolve(knowledgeItems.length > 0 ? knowledgeItems : []);
      }
    }, 15000); // 15 second timeout
    
    eventSource.onopen = (event) => {
      console.log('SSE connection opened successfully', event);
    };
    
    eventSource.onmessage = (event) => {
      try {
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
          clearTimeout(timeout);
          eventSource.close();
          resolve(knowledgeItems);
        }
      } catch (error) {
        console.error('Error processing SSE message:', error);
      }
    };
    
    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      clearTimeout(timeout);
      eventSource.close();
      
      if (knowledgeItems.length > 0) {
        resolve(knowledgeItems); // Return partial results if available
      } else {
        reject(new Error('SSE connection failed'));
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
    
    // Use a simpler GET request for health check with a timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(`${endpoint}/health`, {
      method: 'GET',
      headers,
      signal: controller.signal
    }).catch(error => {
      console.error('Health check fetch error:', error);
      // Check if this is a CORS error
      if (error.message && error.message.includes('CORS')) {
        console.error('CORS error detected when connecting to API');
        toast.error('API CORS error', { 
          description: 'Please check CORS configuration on the server' 
        });
      }
      return null;
    });
    
    clearTimeout(timeoutId);
    
    // If response is null, connection failed
    if (!response) {
      return false;
    }
    
    const isHealthy = response.ok;
    console.log(`API health check: ${isHealthy ? 'Healthy' : 'Unhealthy'}`);
    
    return isHealthy;
  } catch (error) {
    console.error('API health check failed:', error);
    
    // Add more detailed error logging
    if (error instanceof TypeError && error.message.includes('NetworkError')) {
      console.error('Network error when connecting to API. Possibly CORS related or server is unavailable.');
    }
    
    return false;
  }
}
