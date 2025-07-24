interface CircuitBreakerConfig {
  failureThreshold: number;
  resetTimeout: number;
  monitoringPeriod: number;
}

interface CircuitBreakerState {
  state: 'closed' | 'open' | 'half-open';
  failureCount: number;
  lastFailureTime: number;
  nextAttemptTime: number;
}

class CircuitBreaker {
  private config: CircuitBreakerConfig;
  private state: CircuitBreakerState;
  private serviceStates: Map<string, CircuitBreakerState> = new Map();

  constructor(config: Partial<CircuitBreakerConfig> = {}) {
    this.config = {
      failureThreshold: 3,
      resetTimeout: 30000, // 30 seconds
      monitoringPeriod: 60000, // 1 minute
      ...config
    };
    
    this.state = this.createInitialState();
  }

  private createInitialState(): CircuitBreakerState {
    return {
      state: 'closed',
      failureCount: 0,
      lastFailureTime: 0,
      nextAttemptTime: 0
    };
  }

  private getServiceState(serviceName: string): CircuitBreakerState {
    if (!this.serviceStates.has(serviceName)) {
      this.serviceStates.set(serviceName, this.createInitialState());
    }
    return this.serviceStates.get(serviceName)!;
  }

  canExecute(serviceName: string): boolean {
    const state = this.getServiceState(serviceName);
    const now = Date.now();

    switch (state.state) {
      case 'closed':
        return true;
      
      case 'open':
        if (now >= state.nextAttemptTime) {
          state.state = 'half-open';
          return true;
        }
        return false;
      
      case 'half-open':
        return true;
      
      default:
        return false;
    }
  }

  onSuccess(serviceName: string): void {
    const state = this.getServiceState(serviceName);
    state.failureCount = 0;
    state.state = 'closed';
    console.log(`✅ Circuit breaker: ${serviceName} reset to closed state`);
  }

  onFailure(serviceName: string, error?: any): void {
    const state = this.getServiceState(serviceName);
    const now = Date.now();
    
    state.failureCount++;
    state.lastFailureTime = now;

    // Skip circuit breaking for 406 errors (Not Acceptable) - these are expected
    if (error?.status === 406 || error?.response?.status === 406) {
      console.log(`⚠️ Circuit breaker: Ignoring 406 error for ${serviceName}`);
      return;
    }

    if (state.failureCount >= this.config.failureThreshold) {
      state.state = 'open';
      state.nextAttemptTime = now + this.config.resetTimeout;
      console.log(`🔴 Circuit breaker: ${serviceName} opened due to ${state.failureCount} failures`);
    }
  }

  getState(serviceName: string): string {
    return this.getServiceState(serviceName).state;
  }

  reset(serviceName: string): void {
    this.serviceStates.set(serviceName, this.createInitialState());
    console.log(`🔄 Circuit breaker: ${serviceName} manually reset`);
  }

  resetAll(): void {
    this.serviceStates.clear();
    console.log('🔄 Circuit breaker: All services reset');
  }
}

// Global circuit breaker instance
export const circuitBreaker = new CircuitBreaker({
  failureThreshold: 3,
  resetTimeout: 30000, // 30 seconds
  monitoringPeriod: 60000 // 1 minute
});

// Wrapper function for API calls with circuit breaker
export async function withCircuitBreaker<T>(
  serviceName: string,
  fn: () => Promise<T>
): Promise<T> {
  if (!circuitBreaker.canExecute(serviceName)) {
    const error = new Error(`Circuit breaker is open for service: ${serviceName}`);
    console.log(`🚫 Circuit breaker: Blocking call to ${serviceName}`);
    throw error;
  }

  try {
    const result = await fn();
    circuitBreaker.onSuccess(serviceName);
    return result;
  } catch (error) {
    circuitBreaker.onFailure(serviceName, error);
    throw error;
  }
}