
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
    
    // Use longer timeout for LinkedIn OAuth (sometimes slower)
    const timeoutMs = service === 'linkedin' ? 45000 : this.connectionTimeoutMs;
    
    const timeoutId = setTimeout(() => {
      console.log(`⏰ Connection timeout for ${service} after ${timeoutMs}ms`);
      this.setConnectionState(service, 'error');
      this.cleanupOAuthState(service);
      onTimeout();
    }, timeoutMs);
    
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
    this.cleanupOAuthState(service);
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
    // Much shorter threshold for stale state - 2 minutes max
    const staleThreshold = 2 * 60 * 1000; // 2 minutes
    
    if (age > staleThreshold) {
      console.log(`🧹 Cleaning stale OAuth state for ${service} (age: ${Math.round(age/1000)}s)`);
      this.cleanupOAuthState(service);
      return null;
    }
    
    // Additional check: if we're recovering 'redirecting' state, verify it's actually valid
    if (state === 'redirecting') {
      // Only allow 'redirecting' state recovery if it's very recent (30 seconds)
      const redirectThreshold = 30 * 1000; // 30 seconds
      if (age > redirectThreshold) {
        console.log(`🧹 Cleaning stale redirecting state for ${service} (age: ${Math.round(age/1000)}s)`);
        this.cleanupOAuthState(service);
        return null;
      }
    }
    
    return state as ConnectionState;
  }

  // Clean up OAuth state
  cleanupOAuthState(service: string) {
    console.log(`🧹 Cleaning OAuth state for ${service}`);
    localStorage.removeItem(`oauth_state_${service}`);
    localStorage.removeItem(`oauth_timestamp_${service}`);
    
    // Also clean up any service-specific OAuth data
    if (service === 'linkedin') {
      localStorage.removeItem('linkedin_connection_attempt');
      localStorage.removeItem('oauth_linkedin');
      localStorage.removeItem('oauth_state');
      localStorage.removeItem('oauth_service');
    }
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
        
        // Enhanced cleanup for all browsers, not just Brave
        if (recoveredState === 'connecting' || recoveredState === 'redirecting') {
          // Set aggressive cleanup for recovered states - much faster
          const cleanupDelay = 2000; // 2 seconds max
          setTimeout(() => {
            const currentState = this.getConnectionState(service);
            if (currentState === 'connecting' || currentState === 'redirecting') {
              console.log(`🧹 Auto-cleaning stuck ${service} state: ${currentState}`);
              this.setConnectionState(service, 'idle');
              this.cleanupOAuthState(service);
            }
          }, cleanupDelay);
        }
      } else {
        // No recovered state - ensure service is in idle state
        this.setConnectionState(service, 'idle');
      }
    });
  }

  // Force cleanup of all stuck states immediately
  forceCleanupAllStates() {
    console.log('🧹 Force cleaning all stuck connection states...');
    const services = ['linkedin', 'wallet', 'twitter', 'telegram', 'discord'];
    
    services.forEach(service => {
      const currentState = this.getConnectionState(service);
      if (currentState === 'connecting' || currentState === 'redirecting') {
        console.log(`🧹 Force cleaning stuck ${service} state: ${currentState}`);
        this.resetConnectionState(service);
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
  // Force cleanup any existing stuck states immediately
  connectionStateManager.forceCleanupAllStates();
  
  // Initialize states when the manager is loaded
  connectionStateManager.initializeStates();
  
  // Reset states when page becomes visible (handles tab switching)
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      connectionStateManager.forceCleanupAllStates();
      connectionStateManager.initializeStates();
    }
  });
  
  window.addEventListener('beforeunload', () => {
    connectionStateManager.cleanup();
  });
}
