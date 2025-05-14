
interface RetryOptions {
  maxRetries: number;
  baseDelay: number;
  retryCondition?: (error: any) => boolean;
}

/**
 * Service for handling automatic retry logic with exponential backoff
 */
export class RetryService {
  private maxRetries: number;
  private baseDelay: number;
  private retryCondition?: (error: any) => boolean;

  constructor(options: RetryOptions) {
    this.maxRetries = options.maxRetries || 3;
    this.baseDelay = options.baseDelay || 1000;
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
        
        // Calculate delay with exponential backoff
        const delay = this.baseDelay * Math.pow(2, attempt);
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
