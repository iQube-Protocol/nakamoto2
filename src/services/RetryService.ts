
/**
 * Options for configuring the retry service
 */
interface RetryOptions {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  retryCondition?: (error: any) => boolean;
}

/**
 * Service for handling retries with exponential backoff
 */
export class RetryService {
  private options: RetryOptions;
  
  constructor(options: Partial<RetryOptions> = {}) {
    this.options = {
      maxRetries: 3,
      baseDelay: 300,
      maxDelay: 5000,
      ...options
    };
  }
  
  /**
   * Execute a function with retry logic
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    let lastError: any;
    let attempt = 0;
    
    while (attempt <= this.options.maxRetries) {
      try {
        if (attempt > 0) {
          console.log(`Retry attempt ${attempt} of ${this.options.maxRetries}`);
        }
        return await fn();
      } catch (error) {
        lastError = error;
        attempt++;
        
        // Check if we should retry based on the error
        if (attempt > this.options.maxRetries || 
           (this.options.retryCondition && !this.options.retryCondition(error))) {
          break;
        }
        
        // Calculate delay with exponential backoff and jitter
        const delay = Math.min(
          this.options.baseDelay * Math.pow(2, attempt - 1) * (0.9 + Math.random() * 0.2),
          this.options.maxDelay
        );
        
        console.log(`Retrying after ${delay.toFixed(0)}ms due to error:`, error);
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError;
  }
  
  /**
   * Modify retry options
   */
  setOptions(options: Partial<RetryOptions>): void {
    this.options = {
      ...this.options,
      ...options
    };
  }
}
