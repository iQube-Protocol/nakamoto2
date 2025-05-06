
import { ConnectionStatus } from './types';
import { AuthManager } from './auth-manager';

export class ConnectionMonitor {
  private connectionCheckInterval: NodeJS.Timeout | null = null;
  private authManager: AuthManager;
  private onStatusChange: (status: ConnectionStatus) => void;
  
  constructor(config: { 
    authManager: AuthManager;
    onStatusChange?: (status: ConnectionStatus) => void;
  }) {
    this.authManager = config.authManager;
    this.onStatusChange = config.onStatusChange || (() => {});
  }
  
  /**
   * Start monitoring connection state
   */
  startMonitoring(): void {
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
   * Set up monitoring for connection state
   */
  setupConnectionMonitoring(): void {
    // Start the monitoring if not already started
    this.startMonitoring();
  }
  
  /**
   * Stop monitoring connection state
   */
  stopMonitoring(): void {
    if (this.connectionCheckInterval) {
      clearInterval(this.connectionCheckInterval);
      this.connectionCheckInterval = null;
    }
  }
  
  /**
   * Clean up resources
   */
  cleanup(): void {
    this.stopMonitoring();
  }
}
