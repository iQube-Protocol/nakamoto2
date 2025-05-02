
import { toast } from 'sonner';
import { ApiLoadCallbacks } from './types';
import { ScriptLoader } from './script-loader';
import { ApiStateManager } from './api-state-manager';

// Constants
const GAPI_SCRIPT_URL = 'https://apis.google.com/js/api.js';
const GSI_SCRIPT_URL = 'https://accounts.google.com/gsi/client';
const DEFAULT_TIMEOUT = 30000; // 30 seconds

/**
 * Manages loading of Google APIs
 */
export class GoogleApiLoader {
  private gapi: any = null;
  private stateManager: ApiStateManager;
  public onApiLoadStart: (() => void) | null = null;
  public onApiLoadComplete: (() => void) | null = null;
  private apiLoadTimeout: number = DEFAULT_TIMEOUT;
  
  constructor(
    callbacks?: ApiLoadCallbacks
  ) {
    this.onApiLoadStart = callbacks?.onApiLoadStart || null;
    this.onApiLoadComplete = callbacks?.onApiLoadComplete || null;
    this.stateManager = new ApiStateManager();
    
    // Load Google API script if it's not already loaded
    this.loadGoogleApi();
  }
  
  /**
   * Force reload Google API scripts
   * This is used when resetting the connection
   */
  public reloadGoogleApi(): void {
    if (typeof window === 'undefined') return;
    
    console.log('MCP: Forcefully reloading Google API scripts...');
    
    // Reset state
    this.stateManager.resetState();
    
    if (this.onApiLoadStart) {
      this.onApiLoadStart();
    }
    
    // Remove existing scripts and reset globals
    ScriptLoader.removeGoogleApiScripts();
    ScriptLoader.resetGoogleApiGlobals();
    
    // Reload the scripts
    this.loadGoogleApi();
  }
  
  /**
   * Load Google API script dynamically with improved error handling
   */
  private loadGoogleApi(): void {
    if (typeof window === 'undefined' || 
        this.stateManager.isLoaded() || 
        this.stateManager.getApiLoadPromise()) {
      return;
    }
    
    // Check if we've exceeded max attempts
    if (!this.stateManager.incrementLoadAttempts()) {
      if (this.onApiLoadComplete) {
        this.onApiLoadComplete();
      }
      return;
    }
    
    const attempts = this.stateManager.getLoadAttempts();
    const maxAttempts = this.stateManager.getState().maxLoadAttempts;
    console.log(`MCP: Loading Google API scripts... (Attempt ${attempts}/${maxAttempts})`);
    
    if (this.onApiLoadStart) {
      this.onApiLoadStart();
    }
    
    // First check if APIs are already loaded
    if (this.stateManager.checkGoogleApiGlobals()) {
      console.log('MCP: Google APIs already loaded');
      this.gapi = (window as any).gapi;
      this.stateManager.setLoaded(true);
      if (this.onApiLoadComplete) {
        this.onApiLoadComplete();
      }
      this.stateManager.setApiLoadPromise(Promise.resolve(true));
      return;
    }
    
    // Create a promise that resolves when both scripts are loaded or rejects on timeout
    const loadPromise = new Promise<boolean>((resolve, reject) => {
      let gapiLoaded = false;
      let gsiLoaded = false;
      let timeoutTriggered = false;
      
      // Set a timeout to prevent hanging if scripts fail to load
      const timeoutId = setTimeout(() => {
        if (!gapiLoaded || !gsiLoaded) {
          console.error('MCP: Google API loading timed out after', this.apiLoadTimeout / 1000, 'seconds');
          timeoutTriggered = true;
          if (this.onApiLoadComplete) {
            this.onApiLoadComplete();
          }
          
          // Try again if we haven't exceeded max attempts
          if (this.stateManager.getLoadAttempts() < this.stateManager.getState().maxLoadAttempts) {
            console.log(`MCP: Retrying Google API load (Attempt ${this.stateManager.getLoadAttempts() + 1}/${this.stateManager.getState().maxLoadAttempts})`);
            this.stateManager.setApiLoadPromise(null); // Reset the promise so we can try again
            this.loadGoogleApi(); // Recursive call to try loading again
          } else {
            reject(new Error('Google API loading timed out after maximum attempts'));
          }
        }
      }, this.apiLoadTimeout);
      
      const checkAllLoaded = () => {
        if (gapiLoaded && gsiLoaded && !timeoutTriggered) {
          clearTimeout(timeoutId);
          console.log('MCP: Both Google APIs loaded successfully');
          this.gapi = (window as any).gapi;
          if (this.onApiLoadComplete) {
            this.onApiLoadComplete();
          }
          this.stateManager.setLoaded(true);
          resolve(true);
        }
      };
      
      // Load GAPI script
      this.loadGapiScript()
        .then(() => {
          gapiLoaded = true;
          checkAllLoaded();
        })
        .catch((e) => this.handleScriptLoadError(e, timeoutId, timeoutTriggered, reject));
      
      // Load GSI script in parallel
      this.loadGsiScript()
        .then(() => {
          gsiLoaded = true;
          checkAllLoaded();
        })
        .catch((e) => this.handleScriptLoadError(e, timeoutId, timeoutTriggered, reject));
    });
    
    this.stateManager.setApiLoadPromise(loadPromise);
  }
  
  /**
   * Load Google API Client script
   */
  private loadGapiScript(): Promise<void> {
    return ScriptLoader.loadScript(GAPI_SCRIPT_URL, {
      async: true, 
      defer: true,
      timeout: this.apiLoadTimeout
    }).then(() => {
      console.log('MCP: Google API script loaded');
      this.gapi = (window as any).gapi;
      
      if (!this.gapi) {
        return Promise.reject(new Error('Google API failed to load'));
      }
      
      return new Promise<void>((resolve, reject) => {
        this.gapi.load('client', {
          callback: () => {
            console.log('MCP: Google API client loaded successfully');
            resolve();
          },
          onerror: (e: any) => {
            console.error('MCP: Failed to load Google API client:', e);
            reject(e);
          },
          timeout: 20000, // 20 seconds
          ontimeout: () => {
            console.error('MCP: Google API client load timed out');
            reject(new Error('Google API client load timed out'));
          }
        });
      });
    });
  }
  
  /**
   * Load Google Sign-In script
   */
  private loadGsiScript(): Promise<void> {
    return ScriptLoader.loadScript(GSI_SCRIPT_URL, {
      async: true, 
      defer: true,
      timeout: this.apiLoadTimeout
    }).then(() => {
      console.log('MCP: Google Sign-In script loaded');
    });
  }
  
  /**
   * Handle script load error with retry logic
   */
  private handleScriptLoadError(
    error: Error, 
    timeoutId: NodeJS.Timeout | null,
    timeoutTriggered: boolean,
    reject: (reason: Error) => void
  ): void {
    console.error('MCP: Script load error:', error);
    
    if (!timeoutTriggered && timeoutId) {
      clearTimeout(timeoutId);
      if (this.onApiLoadComplete) {
        this.onApiLoadComplete();
      }
      
      // Toast error message
      toast.error('Failed to load Google API script', {
        description: 'Please check your internet connection and try again.'
      });
      
      // Retry logic
      if (this.stateManager.getLoadAttempts() < this.stateManager.getState().maxLoadAttempts) {
        console.log(`MCP: Retrying Google API load after error (Attempt ${this.stateManager.getLoadAttempts() + 1}/${this.stateManager.getState().maxLoadAttempts})`);
        this.stateManager.setApiLoadPromise(null);
        this.loadGoogleApi();
      } else {
        reject(error);
      }
    }
  }
  
  /**
   * Ensures Google API is loaded before proceeding with proper timeout
   */
  public async ensureGoogleApiLoaded(): Promise<boolean> {
    // Quick check if API is already loaded
    if (this.stateManager.isLoaded() && this.stateManager.checkGoogleApiGlobals()) {
      console.log('MCP: Google API already loaded, returning true immediately');
      this.gapi = (window as any).gapi;
      return true;
    }
    
    // Check if gapi is available in window
    if ((window as any).gapi && (window as any).google?.accounts) {
      console.log('MCP: Google APIs detected in window, setting loaded state');
      this.gapi = (window as any).gapi;
      this.stateManager.setLoaded(true);
      return true;
    }
    
    console.log('MCP: Ensuring Google API is loaded...');
    
    const currentPromise = this.stateManager.getApiLoadPromise();
    if (currentPromise) {
      try {
        console.log('MCP: Waiting for existing API load promise to resolve...');
        const loadTimeout = new Promise<boolean>((_, reject) => {
          setTimeout(() => reject(new Error('Google API loading timed out')), this.apiLoadTimeout);
        });
        
        // Race between the loading promise and timeout
        const result = await Promise.race([currentPromise, loadTimeout]);
        this.stateManager.setLoaded(result);
        console.log('MCP: API load promise resolved with result:', result);
        return result;
      } catch (e) {
        console.error('Error waiting for Google API to load:', e);
        toast.error('Failed to load Google API', {
          description: 'Please refresh the page and try again'
        });
        
        // Try again if we haven't exceeded max attempts
        if (this.stateManager.getLoadAttempts() < this.stateManager.getState().maxLoadAttempts) {
          console.log('MCP: Retrying API load after failure');
          this.stateManager.setApiLoadPromise(null);
          // Return the result of recursive call
          return this.ensureGoogleApiLoaded();
        }
        
        return false;
      }
    } else {
      // If apiLoadPromise doesn't exist yet, start loading process
      console.log('MCP: No existing load promise, initiating API loading');
      this.loadGoogleApi();
      
      const newPromise = this.stateManager.getApiLoadPromise();
      if (!newPromise) {
        console.error('Failed to initialize API loading process');
        return false;
      }
      
      try {
        console.log('MCP: Waiting for new API load promise to resolve...');
        const result = await newPromise;
        console.log('MCP: New API load promise resolved with result:', result);
        return result;
      } catch (e) {
        console.error('Error starting Google API load:', e);
        return false;
      }
    }
  }
  
  /**
   * Get the Google API client
   */
  public getGapiClient() {
    // Make sure we always return the most up-to-date gapi reference
    if ((window as any).gapi) {
      this.gapi = (window as any).gapi;
    }
    return this.gapi;
  }
  
  /**
   * Get the load state
   */
  public isLoaded(): boolean {
    // First check the state manager
    if (this.stateManager.isLoaded()) {
      return true;
    }
    
    // Also check if APIs are available in window 
    // (they might have been loaded by another script)
    const apisAvailable = this.stateManager.checkGoogleApiGlobals();
    if (apisAvailable) {
      // Update our state
      this.stateManager.setLoaded(true);
      this.gapi = (window as any).gapi;
    }
    
    return apisAvailable;
  }
  
  /**
   * Get current load attempt count
   */
  public getLoadAttempts(): number {
    return this.stateManager.getLoadAttempts();
  }
  
  /**
   * Reset load attempts counter
   */
  public resetLoadAttempts(): void {
    this.stateManager.resetLoadAttempts();
  }
  
  /**
   * Set the API load timeout
   */
  public setApiLoadTimeout(timeout: number): void {
    if (timeout > 0) {
      this.apiLoadTimeout = timeout;
    }
  }
}
