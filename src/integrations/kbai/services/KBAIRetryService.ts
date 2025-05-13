
/**
 * Service for handling retry logic
 */
export class KBAIRetryService {
  private maxRetries: number;
  private retryDelay: number;
  
  constructor(maxRetries = 2, retryDelayMs = 1000) {
    this.maxRetries = maxRetries;
    this.retryDelay = retryDelayMs;
  }
  
  /**
   * Execute function with retry logic
   */
  public async executeWithRetry<T>(
    operation: () => Promise<T>, 
    onRetry?: (attempt: number, error: Error) => void
  ): Promise<T> {
    let currentRetry = 0;
    let lastError: Error | null = null;
    
    while (currentRetry <= this.maxRetries) {
      try {
        if (currentRetry > 0) {
          console.log(`Retry attempt ${currentRetry} of ${this.maxRetries}`);
          // Wait before retry with exponential backoff
          await new Promise(resolve => 
            setTimeout(resolve, this.retryDelay * Math.pow(2, currentRetry - 1))
          );
          
          if (onRetry && lastError) {
            onRetry(currentRetry, lastError);
          }
        }
        
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        currentRetry++;
        console.warn(`Operation failed on attempt ${currentRetry}:`, error);
        
        if (currentRetry > this.maxRetries) {
          throw lastError;
        }
      }
    }
    
    // This shouldn't be reached due to the throw in the loop
    throw lastError || new Error('Unknown error during retry');
  }
}
