
interface RetryOptions {
  maxRetries: number;
  baseDelay: number;
  maxDelay?: number;
  exponentialFactor?: number;
  retryCondition?: (error: any) => boolean;
}

/**
 * Service for handling automatic retry logic with exponential backoff
 */
export class RetryService {
  private maxRetries: number;
  private baseDelay: number;
  private maxDelay: number;
  private exponentialFactor: number;
  private retryCondition?: (error: any) => boolean;

  constructor(options: RetryOptions) {
    this.maxRetries = options.maxRetries || 3;
    this.baseDelay = options.baseDelay || 1000;
    this.maxDelay = options.maxDelay || 10000; // Default max delay of 10 seconds
    this.exponentialFactor = options.exponentialFactor || 2;
    this.retryCondition = options.retryCondition;
  }

  /**
   * Execute a function with retry logic
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    let lastError: any;
    let attempt = 0;

    while (attempt <= this.maxRetries) {
      try {
        if (attempt > 0) {
          console.log(`Retry attempt ${attempt}/${this.maxRetries}...`);
        }
        
        return await fn();
      } catch (error) {
        lastError = error;
        
        // Check if we should retry based on the error and current attempt
        if (attempt >= this.maxRetries || 
            (this.retryCondition && !this.retryCondition(error))) {
          console.error(`All retry attempts failed (${attempt}/${this.maxRetries}):`, error);
          break;
        }
        
        // Calculate delay with exponential backoff, capped at maxDelay
        const delay = Math.min(
          this.baseDelay * Math.pow(this.exponentialFactor, attempt),
          this.maxDelay
        );
        console.log(`Retrying in ${delay}ms after error:`, error);
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay));
        attempt++;
      }
    }
    
    // If we've exhausted all retries, throw the last error
    throw lastError;
  }
}
