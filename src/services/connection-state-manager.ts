
import { toast } from 'sonner';

export type ConnectionState = 'idle' | 'connecting' | 'connected' | 'disconnecting' | 'error';

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

  cleanup() {
    this.timeouts.forEach(timeout => clearTimeout(timeout));
    this.timeouts.clear();
    this.connectionStates.clear();
    this.connectionAttempts.clear();
  }
}

export const connectionStateManager = new ConnectionStateManager();

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    connectionStateManager.cleanup();
  });
}
