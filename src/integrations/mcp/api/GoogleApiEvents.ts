
/**
 * Manages event callbacks for Google API loading
 */
export class GoogleApiEvents {
  private onApiLoadStartCallback: (() => void) | undefined;
  private onApiLoadCompleteCallback: ((success: boolean) => void) | undefined;
  
  constructor(
    onApiLoadStart?: () => void,
    onApiLoadComplete?: ((success: boolean) => void) | undefined
  ) {
    this.onApiLoadStartCallback = onApiLoadStart;
    this.onApiLoadCompleteCallback = onApiLoadComplete;
  }
  
  /**
   * Trigger API load start event
   */
  public triggerLoadStart(): void {
    if (this.onApiLoadStartCallback) {
      this.onApiLoadStartCallback();
    }
  }
  
  /**
   * Trigger API load complete event
   */
  public triggerLoadComplete(success: boolean = true): void {
    if (this.onApiLoadCompleteCallback) {
      this.onApiLoadCompleteCallback(success);
    }
  }
}
