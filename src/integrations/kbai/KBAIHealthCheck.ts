
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
   * Check if the edge function is reachable
   */
  async checkEdgeFunctionHealth(): Promise<boolean> {
    try {
      console.log(`Checking health of edge function at: ${this.edgeFunctionUrl}/health`);
      const response = await fetch(`${this.edgeFunctionUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token') || ''}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Edge function health check successful:', data);
        return true;
      } else {
        console.error('Edge function health check failed with status:', response.status);
        const text = await response.text();
        console.error('Response body:', text);
        return false;
      }
    } catch (error) {
      console.error('Error during edge function health check:', error);
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
      
      // Return diagnostic results
      return {
        edgeFunctionHealthy: isEdgeFunctionHealthy,
        connectionStatus: connectionStatus as any,
        errorMessage,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error running diagnostics:', error);
      
      return {
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      };
    }
  }
}
