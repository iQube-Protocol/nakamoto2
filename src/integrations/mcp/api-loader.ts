
import { toast } from 'sonner';

/**
 * Manages loading of Google APIs
 */
export class GoogleApiLoader {
  private gapi: any = null;
  private isApiLoaded: boolean = false;
  private apiLoadPromise: Promise<boolean> | null = null;
  public onApiLoadStart: (() => void) | null = null;
  public onApiLoadComplete: (() => void) | null = null;
  private apiLoadTimeout: number = 30000; // 30s timeout for API loading
  private loadAttempts: number = 0;
  private maxLoadAttempts: number = 3;
  
  constructor(
    onApiLoadStart?: () => void,
    onApiLoadComplete?: () => void
  ) {
    this.onApiLoadStart = onApiLoadStart || null;
    this.onApiLoadComplete = onApiLoadComplete || null;
    
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
    this.isApiLoaded = false;
    this.apiLoadPromise = null;
    this.loadAttempts = 0;
    
    if (this.onApiLoadStart) {
      this.onApiLoadStart();
    }
    
    // Remove any existing scripts first
    const existingScripts = document.querySelectorAll('script[src*="apis.google.com"], script[src*="accounts.google.com"]');
    existingScripts.forEach(script => {
      script.remove();
    });
    
    // Reset global Google API objects
    if ((window as any).gapi) {
      try {
        // Try to clean up any event listeners
        if ((window as any).gapi.auth && (window as any).gapi.auth.authorize) {
          (window as any).gapi.auth.authorize = null;
        }
      } catch (e) {
        console.warn('Error cleaning up gapi auth:', e);
      }
      
      // Set gapi to undefined
      (window as any).gapi = undefined;
    }
    
    if ((window as any).google?.accounts) {
      try {
        (window as any).google.accounts = undefined;
      } catch (e) {
        console.warn('Error cleaning up Google accounts:', e);
      }
    }
    
    // Reload the scripts
    this.loadGoogleApi();
  }
  
  /**
   * Load Google API script dynamically with improved error handling
   */
  private loadGoogleApi(): void {
    if (typeof window !== 'undefined' && !this.isApiLoaded && !this.apiLoadPromise) {
      // Check if we've exceeded max attempts
      if (this.loadAttempts >= this.maxLoadAttempts) {
        console.error(`MCP: Failed to load Google API after ${this.maxLoadAttempts} attempts`);
        if (this.onApiLoadComplete) {
          this.onApiLoadComplete();
        }
        toast.error('Failed to load Google API', {
          description: 'Please refresh the page and try again'
        });
        return;
      }
      
      this.loadAttempts++;
      console.log(`MCP: Loading Google API scripts... (Attempt ${this.loadAttempts}/${this.maxLoadAttempts})`);
      
      if (this.onApiLoadStart) {
        this.onApiLoadStart();
      }
      
      // First check if APIs are already loaded
      if ((window as any).gapi && (window as any).google?.accounts) {
        console.log('MCP: Google APIs already loaded');
        this.isApiLoaded = true;
        if (this.onApiLoadComplete) {
          this.onApiLoadComplete();
        }
        this.apiLoadPromise = Promise.resolve(true);
        return;
      }
      
      // Create a promise that resolves when both scripts are loaded or rejects on timeout
      this.apiLoadPromise = new Promise((resolve, reject) => {
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
            if (this.loadAttempts < this.maxLoadAttempts) {
              console.log(`MCP: Retrying Google API load (Attempt ${this.loadAttempts + 1}/${this.maxLoadAttempts})`);
              this.apiLoadPromise = null; // Reset the promise so we can try again
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
            if (this.onApiLoadComplete) {
              this.onApiLoadComplete();
            }
            this.isApiLoaded = true;
            resolve(true);
          }
        };
        
        // Add gapi script
        const script = document.createElement('script');
        script.src = 'https://apis.google.com/js/api.js';
        script.async = true;
        script.defer = true; // Add defer attribute to ensure proper loading
        script.onload = () => {
          console.log('MCP: Google API script loaded');
          this.gapi = (window as any).gapi;
          if (this.gapi) {
            this.gapi.load('client', {
              callback: () => {
                console.log('MCP: Google API client loaded successfully');
                gapiLoaded = true;
                checkAllLoaded();
              },
              onerror: (e: any) => {
                console.error('MCP: Failed to load Google API client:', e);
                if (!timeoutTriggered) {
                  clearTimeout(timeoutId);
                  if (this.onApiLoadComplete) {
                    this.onApiLoadComplete();
                  }
                  
                  // Retry logic
                  if (this.loadAttempts < this.maxLoadAttempts) {
                    console.log(`MCP: Retrying Google API load (Attempt ${this.loadAttempts + 1}/${this.maxLoadAttempts})`);
                    this.apiLoadPromise = null;
                    this.loadGoogleApi();
                  } else {
                    reject(e);
                  }
                }
              },
              timeout: 20000, // 20 seconds
              ontimeout: () => {
                console.error('MCP: Google API client load timed out');
                if (!timeoutTriggered) {
                  clearTimeout(timeoutId);
                  if (this.onApiLoadComplete) {
                    this.onApiLoadComplete();
                  }
                  
                  // Retry logic
                  if (this.loadAttempts < this.maxLoadAttempts) {
                    console.log(`MCP: Retrying Google API load after timeout (Attempt ${this.loadAttempts + 1}/${this.maxLoadAttempts})`);
                    this.apiLoadPromise = null;
                    this.loadGoogleApi();
                  } else {
                    reject(new Error('Google API client load timed out after maximum attempts'));
                  }
                }
              }
            });
          } else {
            console.error('MCP: Google API failed to load');
            if (!timeoutTriggered) {
              clearTimeout(timeoutId);
              if (this.onApiLoadComplete) {
                this.onApiLoadComplete();
              }
              
              // Retry logic
              if (this.loadAttempts < this.maxLoadAttempts) {
                console.log(`MCP: Retrying Google API load (Attempt ${this.loadAttempts + 1}/${this.maxLoadAttempts})`);
                this.apiLoadPromise = null;
                this.loadGoogleApi();
              } else {
                reject(new Error('Google API failed to load after maximum attempts'));
              }
            }
          }
        };
        script.onerror = (e) => {
          console.error('Failed to load Google API script:', e);
          if (!timeoutTriggered) {
            clearTimeout(timeoutId);
            toast.error('Failed to load Google API script', {
              description: 'Please check your internet connection and try again.'
            });
            if (this.onApiLoadComplete) {
              this.onApiLoadComplete();
            }
            
            // Retry logic
            if (this.loadAttempts < this.maxLoadAttempts) {
              console.log(`MCP: Retrying Google API load after error (Attempt ${this.loadAttempts + 1}/${this.maxLoadAttempts})`);
              this.apiLoadPromise = null;
              this.loadGoogleApi();
            } else {
              reject(e);
            }
          }
        };
        
        // Add GSI script in parallel 
        const gsiScript = document.createElement('script');
        gsiScript.src = 'https://accounts.google.com/gsi/client';
        gsiScript.async = true;
        gsiScript.defer = true; // Add defer attribute to ensure proper loading
        gsiScript.onload = () => {
          console.log('MCP: Google Sign-In script loaded');
          gsiLoaded = true;
          checkAllLoaded();
        };
        gsiScript.onerror = (e) => {
          console.error('Failed to load Google Sign-In script:', e);
          if (!timeoutTriggered) {
            clearTimeout(timeoutId);
            toast.error('Failed to load Google Sign-In script', {
              description: 'Please check your internet connection and try again.'
            });
            if (this.onApiLoadComplete) {
              this.onApiLoadComplete();
            }
            
            // Retry logic
            if (this.loadAttempts < this.maxLoadAttempts) {
              console.log(`MCP: Retrying Google API load after GSI error (Attempt ${this.loadAttempts + 1}/${this.maxLoadAttempts})`);
              this.apiLoadPromise = null;
              this.loadGoogleApi();
            } else {
              reject(e);
            }
          }
        };
        
        // Add both scripts to document
        document.body.appendChild(script);
        document.body.appendChild(gsiScript);
      });
    }
  }
  
  /**
   * Ensures Google API is loaded before proceeding with proper timeout
   */
  public async ensureGoogleApiLoaded(): Promise<boolean> {
    // Quick check if API is already loaded
    if (this.isApiLoaded || (
      window && (window as any).gapi && 
      (window as any).gapi.client && 
      (window as any).google?.accounts
    )) {
      this.isApiLoaded = true;
      return true;
    }
    
    if (this.apiLoadPromise) {
      try {
        const loadTimeout = new Promise<boolean>((_, reject) => {
          setTimeout(() => reject(new Error('Google API loading timed out')), this.apiLoadTimeout);
        });
        
        // Race between the loading promise and timeout
        const result = await Promise.race([this.apiLoadPromise, loadTimeout]);
        this.isApiLoaded = result;
        return result;
      } catch (e) {
        console.error('Error waiting for Google API to load:', e);
        toast.error('Failed to load Google API', {
          description: 'Please refresh the page and try again'
        });
        
        // Try again if we haven't exceeded max attempts
        if (this.loadAttempts < this.maxLoadAttempts) {
          this.apiLoadPromise = null;
          return this.loadGoogleApi();
        }
        
        return false;
      }
    } else {
      // If apiLoadPromise doesn't exist yet, start loading process
      this.loadGoogleApi();
      
      if (!this.apiLoadPromise) {
        console.error('Failed to initialize API loading process');
        return false;
      }
      
      try {
        const result = await this.apiLoadPromise;
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
    return this.gapi;
  }
  
  /**
   * Get the load state
   */
  public isLoaded(): boolean {
    return this.isApiLoaded;
  }
  
  /**
   * Get current load attempt count
   */
  public getLoadAttempts(): number {
    return this.loadAttempts;
  }
  
  /**
   * Reset load attempts counter
   */
  public resetLoadAttempts(): void {
    this.loadAttempts = 0;
  }
}
