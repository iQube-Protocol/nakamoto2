
import { toast } from 'sonner';

interface RetryOptions {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  exponentialFactor?: number;  // Added this property
  jitter?: boolean;
  retryCondition?: (error: any) => boolean;
  onRetry?: (error: any, attempt: number) => void;
  retryNotification?: boolean;
}

/**
 * Service for handling retries with exponential backoff and improved error handling
 */
export class RetryService {
  private options: RetryOptions;
  private lastErrorTime: number = 0;
  private errorCooldown: number = 3000; // Minimum time between error notifications
  
  constructor(options: RetryOptions) {
    this.options = {
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 10000,
      jitter: true,
      retryNotification: true,
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
        
        // Check if we should retry based on error type
        const shouldRetry = attempt <= this.options.maxRetries && 
          (!this.options.retryCondition || this.options.retryCondition(error));
        
        if (!shouldRetry) {
          console.log(`Not retrying after attempt ${attempt}: ${error.message || 'Unknown error'}`);
          break;
        }
        
        // Calculate delay with exponential backoff
        const delay = this.calculateDelay(attempt);
        
        // Call onRetry callback if provided
        if (this.options.onRetry) {
          this.options.onRetry(error, attempt);
        }
        
        // Show retry notification if enabled and not too frequent
        if (this.options.retryNotification && this.shouldShowNotification()) {
          this.lastErrorTime = Date.now();
          
          // Show different messages based on error category
          if (this.isNetworkError(error)) {
            toast.error('Network error detected', {
              description: `Retrying in ${Math.round(delay / 1000)}s (${attempt}/${this.options.maxRetries})`,
              duration: 3000,
            });
          } else if (this.isAuthError(error)) {
            toast.error('Authentication error', {
              description: `Attempting to refresh credentials (${attempt}/${this.options.maxRetries})`,
              duration: 3000,
            });
          } else if (this.isCorsError(error)) {
            toast.error('CORS policy error', {
              description: `Trying alternative connection method (${attempt}/${this.options.maxRetries})`,
              duration: 3000,
            });
          } else {
            toast.error('Operation failed', {
              description: `Retrying in ${Math.round(delay / 1000)}s (${attempt}/${this.options.maxRetries})`,
              duration: 3000,
            });
          }
        }
        
        // Wait before next attempt
        console.log(`Waiting ${delay}ms before retry attempt ${attempt}`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    // If we get here, all retries failed
    console.error(`All ${this.options.maxRetries} retry attempts failed. Last error:`, lastError);
    throw lastError;
  }
  
  /**
   * Calculate delay with exponential backoff and optional jitter
   */
  private calculateDelay(attempt: number): number {
    const exponentialDelay = Math.min(
      this.options.maxDelay,
      this.options.baseDelay * Math.pow(2, attempt - 1)
    );
    
    if (this.options.jitter) {
      // Add random jitter (±25% of delay)
      const jitterFactor = 0.75 + Math.random() * 0.5;
      return Math.floor(exponentialDelay * jitterFactor);
    }
    
    return exponentialDelay;
  }
  
  /**
   * Determine if we should show a notification based on cooldown
   */
  private shouldShowNotification(): boolean {
    return Date.now() - this.lastErrorTime > this.errorCooldown;
  }
  
  /**
   * Check if an error is related to network connectivity
   */
  private isNetworkError(error: any): boolean {
    const errorString = String(error).toLowerCase();
    return errorString.includes('network') || 
      errorString.includes('timeout') || 
      errorString.includes('aborted') ||
      errorString.includes('offline');
  }
  
  /**
   * Check if an error is related to authentication
   */
  private isAuthError(error: any): boolean {
    const errorString = String(error).toLowerCase();
    return errorString.includes('auth') || 
      errorString.includes('unauthorized') || 
      errorString.includes('forbidden') ||
      errorString.includes('login') ||
      error.status === 401 || 
      error.status === 403;
  }
  
  /**
   * Check if an error is related to CORS
   */
  private isCorsError(error: any): boolean {
    const errorString = String(error).toLowerCase();
    return errorString.includes('cors') || 
      errorString.includes('origin') ||
      errorString.includes('cross');
  }
}
