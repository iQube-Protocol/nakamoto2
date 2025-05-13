
import { supabase } from '@/integrations/supabase/client';
import { DiagnosticResult } from './types';

/**
 * Handle health checks for KBAI service
 */
export class KBAIHealthCheck {
  private edgeFunctionUrl: string;
  
  constructor(edgeFunctionUrl: string) {
    this.edgeFunctionUrl = edgeFunctionUrl;
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
   * Check if the edge function is reachable
   */
  async checkEdgeFunctionHealth(): Promise<boolean> {
    try {
      console.log(`Checking health of edge function at: ${this.edgeFunctionUrl}/health`);
      
      // First try with direct fetch (no auth token)
      try {
        const directResponse = await fetch(`${this.edgeFunctionUrl}/health`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (directResponse.ok) {
          const data = await directResponse.json();
          console.log('Edge function health check successful (direct):', data);
          return true;
        } else {
          console.log('Direct health check failed, trying with auth token...');
        }
      } catch (directError) {
        console.log('Direct health check error:', directError);
        // Continue to try with auth token
      }
      
      // Get authentication token and try again
      const token = await this.getAuthToken();
      
      const response = await fetch(`${this.edgeFunctionUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Edge function health check successful with auth:', data);
        return true;
      } else {
        console.error('Edge function health check failed with status:', response.status);
        try {
          const text = await response.text();
          console.error('Response body:', text);
        } catch (e) {
          console.error('Could not read response text');
        }
        return false;
      }
    } catch (error) {
      console.error('Error during edge function health check:', error);
      return false;
    }
  }
  
  /**
   * Directly test the edge function endpoint without going through the health endpoint
   */
  private async testDirectCall(): Promise<boolean> {
    try {
      console.log('Testing direct call to edge function...');
      
      const response = await fetch(this.edgeFunctionUrl, {
        method: 'OPTIONS',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok || response.status === 204) {
        console.log('CORS preflight check successful');
        return true;
      } else {
        console.error('CORS preflight check failed with status:', response.status);
        return false;
      }
    } catch (error) {
      console.error('Error during direct edge function call test:', error);
      return false;
    }
  }
  
  /**
   * Run comprehensive diagnostics
   */
  async runDiagnostics(connectionStatus: string, errorMessage: string | null): Promise<DiagnosticResult> {
    console.log('Running knowledge base connection diagnostics...');
    
    try {
      // Check edge function health
      const isEdgeFunctionHealthy = await this.checkEdgeFunctionHealth();
      console.log('Edge function health check result:', isEdgeFunctionHealthy);
      
      // If health check failed, test direct call
      let corsResult = false;
      if (!isEdgeFunctionHealthy) {
        corsResult = await this.testDirectCall();
        console.log('CORS preflight test result:', corsResult);
      }
      
      // Return diagnostic results
      return {
        edgeFunctionHealthy: isEdgeFunctionHealthy,
        corsConfigured: corsResult,
        connectionStatus: connectionStatus as any,
        errorMessage,
        timestamp: new Date().toISOString(),
        details: {
          edgeFunctionUrl: this.edgeFunctionUrl
        }
      };
    } catch (error) {
      console.error('Error running diagnostics:', error);
      
      return {
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
        details: {
          edgeFunctionUrl: this.edgeFunctionUrl
        }
      };
    }
  }
}
