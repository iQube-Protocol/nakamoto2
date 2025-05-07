
import { ScriptLoader } from './script-loader';

// Define callback types
export type LoadCallback = () => void;

/**
 * Handles loading of the Google API
 */
export class GoogleApiLoader {
  private isApiLoaded: boolean = false;
  private loadPromise: Promise<void> | null = null;
  private loadAttempts: number = 0;
  private maxLoadAttempts: number = 3;
  private apiLoadTimeout: number = 30000; // 30 seconds default timeout
  private scriptLoader: typeof ScriptLoader;
  private onApiLoadStart: LoadCallback | undefined;
  private onApiLoadComplete: LoadCallback | undefined;
  
  /**
   * Create a new Google API loader
   */
  constructor(options?: {
    onApiLoadStart?: LoadCallback;
    onApiLoadComplete?: LoadCallback;
  }) {
    this.scriptLoader = ScriptLoader; // Use the class directly for static methods
    this.onApiLoadStart = options?.onApiLoadStart;
    this.onApiLoadComplete = options?.onApiLoadComplete;
  }
  
  /**
   * Set the API load timeout
   */
  setApiLoadTimeout(timeout: number): void {
    this.apiLoadTimeout = timeout;
  }
  
  /**
   * Check if the API is loaded
   */
  isLoaded(): boolean {
    // More thorough check for GAPI availability
    const gapiAvailable = typeof window !== 'undefined' && 
                         (window as any).gapi && 
                         (window as any).gapi.client && 
                         typeof (window as any).gapi.client === 'object';
    
    const gsiAvailable = typeof window !== 'undefined' && 
                        (window as any).google && 
                        (window as any).google.accounts;
    
    const isApiReady = gapiAvailable && gsiAvailable;
    
    // Update our internal state if APIs are available
    if (isApiReady && !this.isApiLoaded) {
      console.log('GoogleApiLoader: APIs detected as available, updating internal state');
      this.isApiLoaded = true;
    }
    
    return this.isApiLoaded || isApiReady;
  }
  
  /**
   * Get the GAPI client if available
   */
  getGapiClient(): any {
    if (typeof window !== 'undefined' && (window as any).gapi && (window as any).gapi.client) {
      return (window as any).gapi.client;
    }
    return null;
  }
  
  /**
   * Set a flag to prevent multiple simultaneous load attempts
   */
  markAsLoaded(): void {
    this.isApiLoaded = true;
  }
  
  /**
   * Reset the loaded state - useful for testing or forcing a reload
   */
  resetLoadedState(): void {
    this.isApiLoaded = false;
    this.loadPromise = null;
  }
  
  /**
   * Get the number of load attempts
   */
  getLoadAttempts(): number {
    return this.loadAttempts;
  }
  
  /**
   * Reset load attempts counter
   */
  resetLoadAttempts(): void {
    this.loadAttempts = 0;
  }
  
  /**
   * Completely reset the Google API connection state
   * This will:
   * 1. Reset the loaded state
   * 2. Reset load attempts
   * 3. Clean up existing auth state if possible
   * 4. Clear any pending promises
   * 5. Attempt to clear cached auth tokens from the Google side
   */
  fullReset(): void {
    this.resetLoadedState();
    this.resetLoadAttempts();
    this.loadPromise = null;
    
    if (typeof window === 'undefined') return;
    
    // Try to sign out if gapi is available
    if ((window as any).gapi && (window as any).gapi.auth2) {
      try {
        const authInstance = (window as any).gapi.auth2.getAuthInstance();
        if (authInstance) {
          console.log('GoogleApiLoader: Signing out of Google Auth');
          authInstance.signOut().catch((e: any) => {
            console.warn('GoogleApiLoader: Error during signout:', e);
          });
        }
      } catch (e) {
        console.warn('GoogleApiLoader: Error accessing auth instance during reset', e);
      }
    }
    
    // Try to revoke token access
    if ((window as any).google?.accounts?.oauth2) {
      try {
        console.log('GoogleApiLoader: Attempting to revoke OAuth token');
        const token = localStorage.getItem('gdrive-auth-token');
        if (token) {
          try {
            const parsedToken = JSON.parse(token);
            if (parsedToken.access_token) {
              (window as any).google.accounts.oauth2.revoke(parsedToken.access_token, () => {
                console.log('GoogleApiLoader: Token revoked successfully');
              });
            }
          } catch (e) {
            console.warn('GoogleApiLoader: Error parsing token during revoke:', e);
          }
        }
      } catch (e) {
        console.warn('GoogleApiLoader: Error revoking token:', e);
      }
    }
    
    // Try to disable Google Identity Services auto-select (single sign-on)
    if ((window as any).google?.accounts?.id) {
      try {
        console.log('GoogleApiLoader: Disabling Google Identity auto select');
        (window as any).google.accounts.id.disableAutoSelect();
        (window as any).google.accounts.id.cancel();
      } catch (e) {
        console.warn('GoogleApiLoader: Error disabling Google Identity auto select:', e);
      }
    }
    
    // For a more thorough reset, use ScriptLoader to remove Google scripts
    // Only do this in development to avoid affecting other Google integrations
    if (process.env.NODE_ENV === 'development') {
      try {
        ScriptLoader.removeGoogleApiScripts();
        // Optional: Reset the global objects
        ScriptLoader.resetGoogleApiGlobals();
        console.log('GoogleApiLoader: Google scripts removed from DOM');
      } catch (e) {
        console.warn('GoogleApiLoader: Error removing Google scripts:', e);
      }
    }
    
    console.log('GoogleApiLoader: API connection fully reset');
  }
  
  /**
   * Force reload the Google API
   */
  reloadGoogleApi(): void {
    this.resetLoadedState();
    this.resetLoadAttempts();
    this.ensureGoogleApiLoaded(true)
      .then(() => console.log('Google API reloaded successfully'))
      .catch(error => console.error('Failed to reload Google API:', error));
  }
  
  /**
   * Ensure that the Google API is loaded
   */
  async ensureGoogleApiLoaded(forceReload: boolean = false): Promise<boolean> {
    // If already loaded and not force reloading, return immediately
    if (this.isLoaded() && !forceReload) {
      return true;
    }
    
    // If already loading, return existing promise
    if (this.loadPromise && !forceReload) {
      try {
        await this.loadPromise;
        return this.isLoaded();
      } catch (error) {
        console.error('Existing Google API load promise failed:', error);
        // Continue with a new load attempt
        this.loadPromise = null;
      }
    }
    
    // Increase load attempts counter
    this.loadAttempts++;
    
    // If we've exceeded max attempts, throw error
    if (this.loadAttempts > this.maxLoadAttempts) {
      console.error(`Failed to load Google API after ${this.maxLoadAttempts} attempts`);
      return Promise.reject(new Error(`Failed to load Google API after ${this.maxLoadAttempts} attempts`));
    }
    
    // Call the onApiLoadStart callback if provided
    if (this.onApiLoadStart) {
      this.onApiLoadStart();
    }
    
    // Create a new promise to load both gapi and google libraries
    this.loadPromise = this.loadGoogleApi();
    
    try {
      await this.loadPromise;
      
      // Double check that APIs are actually available
      if (!this.isLoaded()) {
        console.warn('Google API scripts loaded but API objects not detected, waiting...');
        
        // Give browser a bit more time to initialize the API objects
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (!this.isLoaded()) {
          throw new Error('Google API scripts loaded but API objects not available');
        }
      }
      
      this.markAsLoaded();
      
      // Call the onApiLoadComplete callback if provided
      if (this.onApiLoadComplete) {
        this.onApiLoadComplete();
      }
      
      return true;
    } catch (error) {
      // Reset the load promise so we can try again
      this.loadPromise = null;
      
      // If we still have attempts left, try again with backoff
      if (this.loadAttempts < this.maxLoadAttempts) {
        console.warn(`Google API load attempt ${this.loadAttempts} failed, retrying...`);
        const backoffDelay = Math.pow(2, this.loadAttempts) * 1000;
        
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            this.ensureGoogleApiLoaded()
              .then(resolve)
              .catch(reject);
          }, backoffDelay);
        });
      }
      
      return false;
    }
  }
  
  /**
   * Load the Google API
   */
  private loadGoogleApi(): Promise<void> {
    return Promise.all([
      this.loadPromise || this.loadGapiScript(),
      this.loadGsiScript()
    ]).then(() => {
      console.log('Both GAPI and GSI scripts loaded successfully');
      return;
    });
  }
  
  /**
   * Load the GAPI script
   */
  private loadGapiScript(): Promise<void> {
    const gapiLoadPromise = new Promise<void>((resolve, reject) => {
      try {
        // If script is already loaded, resolve immediately
        if (typeof window !== 'undefined' && (window as any).gapi) {
          console.log('GAPI already loaded');
          resolve();
          return;
        }
        
        // Set up timeout
        const timeoutId = setTimeout(() => {
          reject(new Error('GAPI loading timed out'));
        }, this.apiLoadTimeout);
        
        // Load the script using the static method
        ScriptLoader.loadScript('https://apis.google.com/js/api.js', {})
          .then(() => {
            clearTimeout(timeoutId);
            console.log('GAPI script loaded');
            resolve();
          })
          .catch(error => {
            clearTimeout(timeoutId);
            reject(new Error(`Failed to load GAPI script: ${error.message}`));
          });
      } catch (error) {
        reject(new Error(`Error during GAPI script load: ${error instanceof Error ? error.message : String(error)}`));
      }
    });
    
    // Add error handling and timeout
    return this.withTimeout(gapiLoadPromise, 'GAPI script load', this.apiLoadTimeout);
  }
  
  /**
   * Load the GSI script
   */
  private loadGsiScript(): Promise<void> {
    const gsiLoadPromise = new Promise<void>((resolve, reject) => {
      try {
        // If script is already loaded, resolve immediately
        if (typeof window !== 'undefined' && (window as any).google?.accounts) {
          console.log('GSI already loaded');
          resolve();
          return;
        }
        
        // Set up timeout
        const timeoutId = setTimeout(() => {
          reject(new Error('GSI loading timed out'));
        }, this.apiLoadTimeout);
        
        // Load the script using the static method
        ScriptLoader.loadScript('https://accounts.google.com/gsi/client', {})
          .then(() => {
            clearTimeout(timeoutId);
            console.log('GSI script loaded');
            resolve();
          })
          .catch(error => {
            clearTimeout(timeoutId);
            reject(new Error(`Failed to load GSI script: ${error.message}`));
          });
      } catch (error) {
        reject(new Error(`Error during GSI script load: ${error instanceof Error ? error.message : String(error)}`));
      }
    });
    
    // Add error handling and timeout
    return this.withTimeout(gsiLoadPromise, 'GSI script load', this.apiLoadTimeout);
  }
  
  /**
   * Add timeout to a promise
   */
  private withTimeout<T>(promise: Promise<T>, name: string, timeout: number): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`${name} timed out after ${timeout}ms`));
      }, timeout);
      
      promise
        .then(result => {
          clearTimeout(timeoutId);
          resolve(result);
        })
        .catch(error => {
          clearTimeout(timeoutId);
          reject(error);
        });
    });
  }
}
