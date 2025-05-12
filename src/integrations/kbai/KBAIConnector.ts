
import { supabase } from '@/integrations/supabase/client';
import { KBAIQueryOptions, KBAIConnectorResponse } from './types';

/**
 * Service to handle communication with KBAI server via Supabase edge functions
 */
export class KBAIConnector {
  private edgeFunctionUrl: string;
  
  constructor(projectRef: string) {
    this.edgeFunctionUrl = `https://${projectRef}.supabase.co/functions/v1/kbai-connector`;
    console.log(`KBAIConnector initialized with edge function URL: ${this.edgeFunctionUrl}`);
  }
  
  /**
   * Get authentication token from Supabase session
   */
  private async getAuthToken(): Promise<string> {
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token || '';
      return token;
    } catch (error) {
      console.error('Error retrieving auth token:', error);
      return '';
    }
  }
  
  /**
   * Call the KBAI connector edge function with timeout
   */
  async callKBAIConnector(options: KBAIQueryOptions, requestId: string): Promise<KBAIConnectorResponse> {
    // Implement timeout with Promise.race
    const timeoutPromise = new Promise<KBAIConnectorResponse>((_, reject) => {
      setTimeout(() => reject(new Error('KBAI connection timed out after 10 seconds')), 10000);
    });
    
    try {
      console.log(`Calling KBAI connector with request ID: ${requestId}`);
      
      // Get authentication token
      const token = await this.getAuthToken();
      if (!token) {
        console.warn('No authentication token available, proceeding with empty token');
      }
      
      // Try direct fetch first to better diagnose CORS issues
      try {
        console.log(`Attempting direct fetch to: ${this.edgeFunctionUrl}`);
        const directResponse = await fetch(this.edgeFunctionUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ 
            options,
            requestId
          })
        });
        
        console.log(`Direct fetch response status: ${directResponse.status}`);
        
        if (directResponse.ok) {
          const data = await directResponse.json();
          return { data, error: null };
        } else {
          console.warn(`Direct fetch failed with status ${directResponse.status}, falling back to Supabase client`);
          const responseText = await directResponse.text();
          console.warn('Response text:', responseText);
        }
      } catch (directFetchError) {
        console.warn('Direct fetch attempt failed:', directFetchError);
      }
      
      // Fall back to Supabase client if direct fetch fails
      console.log('Falling back to Supabase client for edge function call');
      
      // Call the Supabase edge function with the request ID for tracking
      const functionPromise = supabase.functions.invoke('kbai-connector', {
        body: { 
          options,
          requestId
        }
      }) as Promise<KBAIConnectorResponse>;
      
      // Use Promise.race to implement timeout without AbortController
      const response = await Promise.race([functionPromise, timeoutPromise]);
      return response;
    } catch (error) {
      // Check if this was a timeout error
      if (error instanceof Error && error.message === 'KBAI connection timed out after 10 seconds') {
        throw new Error('KBAI connection timed out after 10 seconds');
      }
      throw error;
    }
  }
}
