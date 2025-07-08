
/**
 * Utility for adding timeout protection to async operations
 */

export interface TimeoutOptions {
  timeoutMs?: number;
  timeoutMessage?: string;
  onTimeout?: () => void;
}

export class TimeoutError extends Error {
  constructor(message: string = 'Operation timed out') {
    super(message);
    this.name = 'TimeoutError';
  }
}

/**
 * Wraps a promise with timeout protection
 */
export function withTimeout<T>(
  promise: Promise<T>,
  options: TimeoutOptions = {}
): Promise<T> {
  const {
    timeoutMs = 15000, // 15 second default timeout
    timeoutMessage = 'Operation timed out',
    onTimeout
  } = options;

  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      const timeoutId = setTimeout(() => {
        if (onTimeout) {
          onTimeout();
        }
        reject(new TimeoutError(timeoutMessage));
      }, timeoutMs);

      // Clean up timeout if promise resolves first
      promise.finally(() => clearTimeout(timeoutId));
    })
  ]);
}

/**
 * Creates an AbortController with timeout
 */
export function createTimeoutController(timeoutMs: number = 15000): {
  controller: AbortController;
  timeoutId: NodeJS.Timeout;
} {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  return { controller, timeoutId };
}

/**
 * Circuit breaker to prevent repeated failed calls
 */
export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private readonly maxFailures: number;
  private readonly resetTimeMs: number;

  constructor(maxFailures = 3, resetTimeMs = 30000) {
    this.maxFailures = maxFailures;
    this.resetTimeMs = resetTimeMs;
  }

  canExecute(): boolean {
    if (this.failures >= this.maxFailures) {
      const timeSinceLastFailure = Date.now() - this.lastFailureTime;
      if (timeSinceLastFailure > this.resetTimeMs) {
        this.reset();
        return true;
      }
      return false;
    }
    return true;
  }

  onSuccess(): void {
    this.reset();
  }

  onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();
  }

  private reset(): void {
    this.failures = 0;
    this.lastFailureTime = 0;
  }

  getStatus(): { failures: number; isOpen: boolean } {
    return {
      failures: this.failures,
      isOpen: this.failures >= this.maxFailures
    };
  }
}
