
/**
 * Manages state for Google API loading process
 */
export class GoogleApiState {
  private isApiLoaded: boolean = false;
  private apiInitialized: boolean = false;
  private scriptLoadAttempts: number = 0;
  private maxLoadAttempts: number = 3;
  private loadTimeout: NodeJS.Timeout | null = null;
  private apiLoadPromise: Promise<boolean> | null = null;
  private isInitializing: boolean = false;
  
  /**
   * Check if API is loaded
   */
  public isLoaded(): boolean {
    return this.isApiLoaded;
  }
  
  /**
   * Set API loaded state
   */
  public setLoaded(loaded: boolean): void {
    this.isApiLoaded = loaded;
  }
  
  /**
   * Check if API is initialized
   */
  public isInitialized(): boolean {
    return this.apiInitialized;
  }
  
  /**
   * Set API initialized state
   */
  public setInitialized(initialized: boolean): void {
    this.apiInitialized = initialized;
  }

  /**
   * Check if API is currently initializing
   */
  public isInInitializingState(): boolean {
    return this.isInitializing;
  }

  /**
   * Set API initializing state
   */
  public setInitializing(initializing: boolean): void {
    this.isInitializing = initializing;
  }
  
  /**
   * Get script load attempts
   */
  public getLoadAttempts(): number {
    return this.scriptLoadAttempts;
  }
  
  /**
   * Reset script load attempts
   */
  public resetLoadAttempts(): void {
    this.scriptLoadAttempts = 0;
  }
  
  /**
   * Increment script load attempts
   */
  public incrementLoadAttempts(): void {
    this.scriptLoadAttempts++;
  }
  
  /**
   * Get maximum load attempts
   */
  public getMaxLoadAttempts(): number {
    return this.maxLoadAttempts;
  }
  
  /**
   * Get API load promise
   */
  public getApiLoadPromise(): Promise<boolean> | null {
    return this.apiLoadPromise;
  }
  
  /**
   * Set API load promise
   */
  public setApiLoadPromise(promise: Promise<boolean> | null): void {
    this.apiLoadPromise = promise;
  }
  
  /**
   * Set load timeout
   */
  public setLoadTimeout(timeout: NodeJS.Timeout): void {
    if (this.loadTimeout) {
      clearTimeout(this.loadTimeout);
    }
    this.loadTimeout = timeout;
  }
  
  /**
   * Clear load timeout
   */
  public clearLoadTimeout(): void {
    if (this.loadTimeout) {
      clearTimeout(this.loadTimeout);
      this.loadTimeout = null;
    }
  }
  
  /**
   * Reset API state
   */
  public reset(): void {
    this.isApiLoaded = false;
    this.apiInitialized = false;
    this.apiLoadPromise = null;
    this.scriptLoadAttempts = 0;
    this.isInitializing = false;
    this.clearLoadTimeout();
  }
}
