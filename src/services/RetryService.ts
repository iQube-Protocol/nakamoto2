
/**
 * Utility service for handling API retries with exponential backoff
 */
export interface RetryOptions {
  maxRetries: number;
  baseDelay: number;
  maxDelay?: number;
  exponentialFactor?: number;
}

export class RetryService {
  private maxRetries: number;
  private baseDelay: number;
  private maxDelay: number;
  private exponentialFactor: number;

  constructor(options: RetryOptions) {
    this.maxRetries = options.maxRetries;
    this.baseDelay = options.baseDelay;
    this.maxDelay = options.maxDelay || 30000; // Default max delay: 30 seconds
    this.exponentialFactor = options.exponentialFactor || 2; // Default exponential factor
  }

  /**
   * Execute a function with retry logic
   * @param fn The async function to execute with retry logic
   * @returns The result of the function
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    let retries = 0;
    let lastError: Error | null = null;

    while (retries <= this.maxRetries) {
      try {
        return await fn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (retries === this.maxRetries) {
          break; // Max retries reached, will throw the error after loop
        }

        // Calculate delay with exponential backoff and jitter
        const delay = Math.min(
          this.baseDelay * Math.pow(this.exponentialFactor, retries) + Math.random() * 1000,
          this.maxDelay
        );
        
        console.log(`Retry attempt ${retries + 1}/${this.maxRetries} after ${Math.round(delay)}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
        retries++;
      }
    }

    // If we get here, all retries have failed
    throw lastError || new Error('Operation failed after maximum retry attempts');
  }
}
