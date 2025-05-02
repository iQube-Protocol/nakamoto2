
import { toast } from 'sonner';
import { ApiLoaderState } from './types';

/**
 * Manages the state of the Google API loader
 */
export class ApiStateManager {
  private state: ApiLoaderState = {
    isApiLoaded: false,
    loadAttempts: 0,
    maxLoadAttempts: 3,
    apiLoadPromise: null
  };
  
  /**
   * Get current loader state
   */
  getState(): ApiLoaderState {
    return { ...this.state };
  }
  
  /**
   * Check if the API is loaded
   */
  isLoaded(): boolean {
    return this.state.isApiLoaded;
  }
  
  /**
   * Set the API loaded state
   */
  setLoaded(loaded: boolean): void {
    this.state.isApiLoaded = loaded;
    
    // Reset load attempts if successfully loaded
    if (loaded) {
      this.resetLoadAttempts();
    }
  }
  
  /**
   * Check if global Google API objects are available
   */
  checkGoogleApiGlobals(): boolean {
    return !!(
      typeof window !== 'undefined' && 
      (window as any).gapi && 
      (window as any).google?.accounts
    );
  }
  
  /**
   * Get current load attempt count
   */
  getLoadAttempts(): number {
    return this.state.loadAttempts;
  }
  
  /**
   * Increment load attempts
   * @returns {boolean} True if max attempts not yet reached
   */
  incrementLoadAttempts(): boolean {
    this.state.loadAttempts++;
    
    // Check if we've hit max attempts
    if (this.state.loadAttempts > this.state.maxLoadAttempts) {
      console.error(`Failed to load Google API after ${this.state.maxLoadAttempts} attempts`);
      toast.error('Failed to load Google API', {
        description: 'Please refresh the page and try again'
      });
      return false;
    }
    
    return true;
  }
  
  /**
   * Reset load attempts counter
   */
  resetLoadAttempts(): void {
    this.state.loadAttempts = 0;
  }
  
  /**
   * Set the promise for API loading
   */
  setApiLoadPromise(promise: Promise<boolean> | null): void {
    this.state.apiLoadPromise = promise;
  }
  
  /**
   * Get the current API load promise
   */
  getApiLoadPromise(): Promise<boolean> | null {
    return this.state.apiLoadPromise;
  }
  
  /**
   * Reset the state for a fresh load attempt
   */
  resetState(): void {
    this.state.isApiLoaded = false;
    this.state.apiLoadPromise = null;
    this.resetLoadAttempts();
  }
  
  /**
   * Set the maximum number of load attempts
   */
  setMaxLoadAttempts(max: number): void {
    if (max > 0) {
      this.state.maxLoadAttempts = max;
    }
  }
}
