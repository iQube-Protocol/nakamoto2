
/**
 * Manages Google API client instances
 */
export class GoogleApiClient {
  private gapi: any = null;
  private tokenClient: any = null;
  
  /**
   * Get Google API client
   */
  public getGapi(): any {
    return this.gapi;
  }
  
  /**
   * Set Google API client
   */
  public setGapi(gapi: any): void {
    this.gapi = gapi;
  }
  
  /**
   * Get token client
   */
  public getTokenClient(): any {
    return this.tokenClient;
  }
  
  /**
   * Set token client
   */
  public setTokenClient(tokenClient: any): void {
    this.tokenClient = tokenClient;
  }
  
  /**
   * Check if API client is fully initialized
   */
  public isClientInitialized(): boolean {
    return this.gapi && this.gapi.client;
  }
  
  /**
   * Reset API client
   */
  public reset(): void {
    this.gapi = null;
    this.tokenClient = null;
  }
}
