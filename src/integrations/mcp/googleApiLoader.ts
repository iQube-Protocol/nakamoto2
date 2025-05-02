
/**
 * Helper for loading and managing Google API scripts
 */
export class GoogleApiLoader {
  private gapi: any = null;
  private tokenClient: any = null;
  private isApiLoaded: boolean = false;
  private apiLoadPromise: Promise<boolean> | null = null;
  private onApiLoadStart: (() => void) | null = null;
  private onApiLoadComplete: (() => void) | null = null;
  private scriptLoadAttempts: number = 0;
  private maxLoadAttempts: number = 3;
  private apiInitialized: boolean = false;
  
  constructor(options: { 
    onApiLoadStart?: () => void; 
    onApiLoadComplete?: () => void; 
  } = {}) {
    this.onApiLoadStart = options.onApiLoadStart || null;
    this.onApiLoadComplete = options.onApiLoadComplete || null;
  }
  
  /**
   * Load Google API script dynamically with improved error handling and retry logic
   */
  public loadGoogleApi(): void {
    if (typeof window !== 'undefined' && !this.isApiLoaded && !this.apiLoadPromise) {
      console.log('MCP: Loading Google API scripts...');
      
      if (this.onApiLoadStart) {
        this.onApiLoadStart();
      }
      
      // Create a promise that resolves when both scripts are loaded
      this.apiLoadPromise = new Promise((resolve, reject) => {
        let gapiLoaded = false;
        let gsiLoaded = false;
        
        const checkAllLoaded = () => {
          if (gapiLoaded && gsiLoaded) {
            if (this.onApiLoadComplete) {
              this.onApiLoadComplete();
            }
            resolve(true);
          }
        };
        
        // Add gapi script
        const script = document.createElement('script');
        script.src = 'https://apis.google.com/js/api.js';
        script.async = true;
        script.onload = () => {
          this.scriptLoadAttempts = 0; // Reset attempts counter on success
          this.onGapiLoaded();
          gapiLoaded = true;
          checkAllLoaded();
        };
        script.onerror = (e) => {
          console.error('Failed to load Google API script:', e);
          this.scriptLoadAttempts++;
          
          if (this.scriptLoadAttempts < this.maxLoadAttempts) {
            console.log(`Retrying Google API script load (attempt ${this.scriptLoadAttempts}/${this.maxLoadAttempts})...`);
            // Remove failed script
            script.remove();
            // Retry after a short delay
            setTimeout(() => this.loadGoogleApi(), 1000);
          } else {
            if (this.onApiLoadComplete) {
              this.onApiLoadComplete();
            }
            reject(e);
          }
        };
        
        // Add GSI script in parallel 
        const gsiScript = document.createElement('script');
        gsiScript.src = 'https://accounts.google.com/gsi/client';
        gsiScript.async = true;
        gsiScript.onload = () => {
          gsiLoaded = true;
          checkAllLoaded();
        };
        gsiScript.onerror = (e) => {
          console.error('Failed to load Google Sign-In script:', e);
          
          // Try again once for GSI script
          if (!gsiLoaded) {
            console.log('Retrying Google Sign-In script load...');
            // Remove failed script
            gsiScript.remove();
            // Create and add a new script element
            const retryScript = document.createElement('script');
            retryScript.src = 'https://accounts.google.com/gsi/client';
            retryScript.async = true;
            retryScript.onload = () => {
              gsiLoaded = true;
              checkAllLoaded();
            };
            retryScript.onerror = (retryError) => {
              console.error('Failed to load Google Sign-In script after retry:', retryError);
              if (this.onApiLoadComplete) {
                this.onApiLoadComplete();
              }
              reject(retryError);
            };
            document.body.appendChild(retryScript);
          } else {
            if (this.onApiLoadComplete) {
              this.onApiLoadComplete();
            }
            reject(e);
          }
        };
        
        // Add both scripts to document
        document.body.appendChild(script);
        document.body.appendChild(gsiScript);
      });
    }
  }
  
  /**
   * Ensures Google API is loaded and initialized before proceeding
   */
  public async ensureGoogleApiLoaded(): Promise<boolean> {
    // If API is already fully loaded and initialized
    if (this.isApiLoaded && this.apiInitialized) return true;
    
    // If we're in the process of loading, wait for it
    if (this.apiLoadPromise) {
      try {
        await this.apiLoadPromise;
        
        // After scripts are loaded, ensure client is initialized
        if (!this.apiInitialized) {
          this.gapi = (window as any).gapi;
          
          // Check if gapi is available now
          if (!this.gapi) {
            console.error('MCP: Google API client not available after loading');
            return false;
          }
          
          // Initialize client
          return new Promise<boolean>((resolve) => {
            this.gapi.load('client', {
              callback: () => {
                this.apiInitialized = true;
                this.isApiLoaded = true;
                console.log('MCP: Google API client initialized successfully');
                resolve(true);
              },
              onerror: () => {
                console.error('MCP: Failed to initialize Google API client');
                resolve(false);
              },
              timeout: 10000
            });
          });
        }
        
        return true;
      } catch (e) {
        console.error('Error ensuring Google API loaded:', e);
        // If promise failed, reset it so we can try loading again
        this.apiLoadPromise = null;
        return false;
      }
    }
    
    // If not loaded at all, start loading
    this.loadGoogleApi();
    return false;
  }
  
  /**
   * Callback when Google API script is loaded
   */
  private onGapiLoaded(): void {
    this.gapi = (window as any).gapi;
    if (!this.gapi) {
      console.error('MCP: Google API client failed to load');
      return;
    }
    
    this.gapi.load('client', {
      callback: () => {
        this.isApiLoaded = true;
        this.apiInitialized = true;
        console.log('MCP: Google API client loaded successfully');
      },
      onerror: (e: any) => {
        console.error('MCP: Failed to load Google API client:', e);
        
        // Retry loading the client once
        console.log('MCP: Retrying to load Google API client...');
        this.gapi.load('client', {
          callback: () => {
            this.isApiLoaded = true;
            this.apiInitialized = true;
            console.log('MCP: Google API client loaded successfully on retry');
          },
          onerror: (retryError: any) => {
            console.error('MCP: Failed to load Google API client after retry:', retryError);
          },
          timeout: 10000, // 10 seconds
        });
      },
      timeout: 10000, // 10 seconds
    });
  }
  
  /**
   * Check if API is fully initialized and ready for use
   */
  public isClientInitialized(): boolean {
    return this.isApiLoaded && this.apiInitialized && 
           this.gapi && this.gapi.client;
  }
  
  /**
   * Reset API loader state
   */
  public reset(): void {
    this.isApiLoaded = false;
    this.apiInitialized = false;
    this.apiLoadPromise = null;
    this.scriptLoadAttempts = 0;
  }
  
  public getGapi(): any {
    return this.gapi;
  }
  
  public setTokenClient(tokenClient: any): void {
    this.tokenClient = tokenClient;
  }
  
  public getTokenClient(): any {
    return this.tokenClient;
  }
  
  public isLoaded(): boolean {
    return this.isApiLoaded;
  }
}
