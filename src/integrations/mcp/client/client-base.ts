
import { GoogleApiLoader } from '../api/google-api-loader';
import { ContextManager } from '../context-manager';
import { MCPClientOptions } from '../types';

/**
 * Base class for the MCP client providing shared functionality
 */
export class MCPClientBase {
  protected apiLoader: GoogleApiLoader;
  protected contextManager: ContextManager;
  protected debugMode: boolean = false;
  
  constructor(options: MCPClientOptions = {}) {
    // Initialize components
    this.apiLoader = new GoogleApiLoader({
      onApiLoadStart: options.onApiLoadStart,
      onApiLoadComplete: options.onApiLoadComplete
    });
    this.contextManager = new ContextManager();
    
    // Set debug mode based on options or environment
    if (options.debug !== undefined) {
      this.debugMode = options.debug;
    } else {
      // Use a browser-safe approach to check for development mode
      this.debugMode = 
        (typeof window !== 'undefined') && 
        (window.location.hostname === 'localhost' || 
         window.location.hostname === '127.0.0.1');
    }
    
    // Set API load timeout if specified
    if (options.apiLoadTimeout && options.apiLoadTimeout > 0) {
      this.apiLoader.setApiLoadTimeout(options.apiLoadTimeout);
    }
  }
  
  /**
   * Helper method for debug logging
   */
  protected log(message: string, ...args: any[]): void {
    if (this.debugMode) {
      console.log(`[MCP] ${message}`, ...args);
    }
  }
  
  /**
   * Helper method for debug error logging
   */
  protected logError(message: string, ...args: any[]): void {
    if (this.debugMode) {
      console.error(`[MCP ERROR] ${message}`, ...args);
    }
  }
  
  /**
   * Check if the Google API is loaded
   */
  public isApiLoaded(): boolean {
    return this.apiLoader.isLoaded();
  }
  
  /**
   * Force reload the Google API
   */
  public reloadGoogleApi(): void {
    return this.apiLoader.reloadGoogleApi();
  }
  
  /**
   * Get current load attempt count
   */
  public getApiLoadAttempts(): number {
    return this.apiLoader.getLoadAttempts();
  }
  
  /**
   * Reset load attempts counter
   */
  public resetApiLoadAttempts(): void {
    this.apiLoader.resetLoadAttempts();
  }
}
