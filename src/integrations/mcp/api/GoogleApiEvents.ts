
/**
 * Manages events for Google API loading process
 */
export class GoogleApiEvents {
  private onApiLoadStart: (() => void) | null = null;
  private onApiLoadComplete: (() => void) | null = null;
  
  constructor(onApiLoadStart: (() => void) | null = null, onApiLoadComplete: (() => void) | null = null) {
    this.onApiLoadStart = onApiLoadStart;
    this.onApiLoadComplete = onApiLoadComplete;
  }
  
  /**
   * Trigger API load start event
   */
  public triggerLoadStart(): void {
    if (this.onApiLoadStart) {
      this.onApiLoadStart();
    }
  }
  
  /**
   * Trigger API load complete event
   */
  public triggerLoadComplete(): void {
    if (this.onApiLoadComplete) {
      this.onApiLoadComplete();
    }
  }
}
