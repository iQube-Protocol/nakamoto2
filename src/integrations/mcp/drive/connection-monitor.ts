
import { ConnectionStatus } from './types';

export class ConnectionMonitor {
  private connectionCheckInterval: NodeJS.Timeout | null = null;
  private authManager: any; // AuthManager reference
  
  constructor(authManager: any) {
    this.authManager = authManager;
  }
  
  /**
   * Set up monitoring for connection state
   */
  setupConnectionMonitoring(): void {
    // Clear any existing intervals
    if (this.connectionCheckInterval) {
      clearInterval(this.connectionCheckInterval);
    }
    
    // Set up interval to periodically verify connection
    this.connectionCheckInterval = setInterval(() => {
      // Only check if we think we're connected
      if (this.authManager.isConnectedToDrive()) {
        this.authManager.verifyConnection().catch(err => {
          console.error('MCP: Connection verification failed:', err);
        });
      }
    }, 60000); // Check every minute
  }
  
  /**
   * Clean up resources
   */
  cleanup(): void {
    if (this.connectionCheckInterval) {
      clearInterval(this.connectionCheckInterval);
      this.connectionCheckInterval = null;
    }
  }
}
