
/**
 * Manages API loading state
 */
export class ApiStateManager {
  private state = {
    loaded: false,
    loading: false,
    loadAttempts: 0,
    maxLoadAttempts: 5,
    lastLoadTime: 0
  };
  
  private apiLoadPromise: Promise<boolean> | null = null;
  
  /**
   * Check if Google API globals are available
   */
  checkGoogleApiGlobals(): boolean {
    if (typeof window === 'undefined') return false;
    
    const hasGapi = typeof (window as any).gapi !== 'undefined';
    const hasGoogleAccounts = typeof (window as any).google?.accounts !== 'undefined';
    
    return hasGapi && hasGoogleAccounts;
  }
  
  /**
   * Check if API is loaded
   */
  isLoaded(): boolean {
    return this.state.loaded;
  }
  
  /**
   * Set loaded state
   */
  setLoaded(loaded: boolean): void {
    this.state.loaded = loaded;
    if (loaded) {
      this.state.loading = false;
      this.state.lastLoadTime = Date.now();
    }
  }
  
  /**
   * Get current load attempts
   */
  getLoadAttempts(): number {
    return this.state.loadAttempts;
  }
  
  /**
   * Increment load attempts and return whether we can try again
   */
  incrementLoadAttempts(): boolean {
    this.state.loadAttempts++;
    return this.state.loadAttempts <= this.state.maxLoadAttempts;
  }
  
  /**
   * Reset load attempts
   */
  resetLoadAttempts(): void {
    this.state.loadAttempts = 0;
  }
  
  /**
   * Reset state
   */
  resetState(): void {
    this.state.loaded = false;
    this.state.loading = false;
    this.apiLoadPromise = null;
  }
  
  /**
   * Get API load promise
   */
  getApiLoadPromise(): Promise<boolean> | null {
    return this.apiLoadPromise;
  }
  
  /**
   * Set API load promise
   */
  setApiLoadPromise(promise: Promise<boolean> | null): void {
    this.apiLoadPromise = promise;
    this.state.loading = !!promise;
  }
  
  /**
   * Get current state
   */
  getState() {
    return { ...this.state };
  }
}
