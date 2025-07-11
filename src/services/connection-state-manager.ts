
import { toast } from 'sonner';

export type ConnectionState = 'idle' | 'connecting' | 'connected' | 'disconnecting' | 'error' | 'redirecting';

interface ConnectionAttempt {
  service: string;
  timestamp: number;
  attempts: number;
}

class ConnectionStateManager {
  private connectionStates: Map<string, ConnectionState> = new Map();
  private connectionAttempts: Map<string, ConnectionAttempt> = new Map();
  private timeouts: Map<string, NodeJS.Timeout> = new Map();
  private maxAttempts = 3;
  private resetTimeMs = 30000; // 30 seconds
  private connectionTimeoutMs = 30000; // 30 seconds

  getConnectionState(service: string): ConnectionState {
    return this.connectionStates.get(service) || 'idle';
  }

  setConnectionState(service: string, state: ConnectionState) {
    console.log(`🔄 Connection state changed: ${service} -> ${state}`);
    this.connectionStates.set(service, state);
    
    // Dispatch event for UI updates
    const event = new CustomEvent('connectionStateChanged', {
      detail: { service, state }
    });
    window.dispatchEvent(event);
  }

  canAttemptConnection(service: string): boolean {
    const attempt = this.connectionAttempts.get(service);
    if (!attempt) return true;

    const timeSinceLastAttempt = Date.now() - attempt.timestamp;
    if (timeSinceLastAttempt > this.resetTimeMs) {
      this.connectionAttempts.delete(service);
      return true;
    }

    return attempt.attempts < this.maxAttempts;
  }

  recordConnectionAttempt(service: string) {
    const existing = this.connectionAttempts.get(service);
    this.connectionAttempts.set(service, {
      service,
      timestamp: Date.now(),
      attempts: (existing?.attempts || 0) + 1
    });
  }

  startConnectionTimeout(service: string, onTimeout: () => void) {
    this.clearConnectionTimeout(service);
    
    const timeoutId = setTimeout(() => {
      console.log(`⏰ Connection timeout for ${service}`);
      this.setConnectionState(service, 'error');
      onTimeout();
      toast.error(`${service} connection timed out. Please try again.`);
    }, this.connectionTimeoutMs);
    
    this.timeouts.set(service, timeoutId);
  }

  clearConnectionTimeout(service: string) {
    const timeoutId = this.timeouts.get(service);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.timeouts.delete(service);
    }
  }

  resetConnectionState(service: string) {
    console.log(`🔄 Resetting connection state for ${service}`);
    this.clearConnectionTimeout(service);
    this.connectionAttempts.delete(service);
    this.setConnectionState(service, 'idle');
  }

  // Store OAuth state persistently across redirects
  storeOAuthState(service: string, state: 'redirecting' | 'connecting') {
    localStorage.setItem(`oauth_state_${service}`, state);
    localStorage.setItem(`oauth_timestamp_${service}`, Date.now().toString());
  }

  // Recover OAuth state after redirect
  recoverOAuthState(service: string): ConnectionState | null {
    const state = localStorage.getItem(`oauth_state_${service}`);
    const timestamp = localStorage.getItem(`oauth_timestamp_${service}`);
    
    if (!state || !timestamp) return null;
    
    const age = Date.now() - parseInt(timestamp);
    const staleThreshold = 5 * 60 * 1000; // 5 minutes
    
    if (age > staleThreshold) {
      console.log(`🧹 Cleaning stale OAuth state for ${service}`);
      this.cleanupOAuthState(service);
      return null;
    }
    
    return state as ConnectionState;
  }

  // Clean up OAuth state
  cleanupOAuthState(service: string) {
    localStorage.removeItem(`oauth_state_${service}`);
    localStorage.removeItem(`oauth_timestamp_${service}`);
  }

  // Initialize and recover states on page load
  initializeStates() {
    // Detect Brave browser for enhanced state recovery
    const isBrave = (navigator as any).brave && typeof (navigator as any).brave.isBrave === 'function';
    
    const services = ['linkedin', 'wallet', 'twitter', 'telegram', 'discord'];
    
    services.forEach(service => {
      const recoveredState = this.recoverOAuthState(service);
      if (recoveredState) {
        console.log(`🔄 Recovered OAuth state for ${service}: ${recoveredState}`);
        this.setConnectionState(service, recoveredState);
        
        // For Brave, add fallback state cleanup after a delay
        if (isBrave && recoveredState === 'connecting') {
          setTimeout(() => {
            const currentState = this.getConnectionState(service);
            if (currentState === 'connecting') {
              console.log(`🛡️ Brave: Cleaning up stale ${service} connecting state`);
              this.setConnectionState(service, 'error');
            }
          }, 5000);
        }
      }
    });
  }

  cleanup() {
    this.timeouts.forEach(timeout => clearTimeout(timeout));
    this.timeouts.clear();
    this.connectionStates.clear();
    this.connectionAttempts.clear();
  }
}

export const connectionStateManager = new ConnectionStateManager();

// Initialize states on page load and cleanup on unload
if (typeof window !== 'undefined') {
  // Initialize states when the manager is loaded
  connectionStateManager.initializeStates();
  
  // Reset states when page becomes visible (handles tab switching)
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      connectionStateManager.initializeStates();
    }
  });
  
  window.addEventListener('beforeunload', () => {
    connectionStateManager.cleanup();
  });
}
