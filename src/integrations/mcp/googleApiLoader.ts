
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
  
  constructor(options: { 
    onApiLoadStart?: () => void; 
    onApiLoadComplete?: () => void; 
  } = {}) {
    this.onApiLoadStart = options.onApiLoadStart || null;
    this.onApiLoadComplete = options.onApiLoadComplete || null;
  }
  
  /**
   * Load Google API script dynamically with improved error handling
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
          this.onGapiLoaded();
          gapiLoaded = true;
          checkAllLoaded();
        };
        script.onerror = (e) => {
          console.error('Failed to load Google API script:', e);
          if (this.onApiLoadComplete) {
            this.onApiLoadComplete();
          }
          reject(e);
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
          if (this.onApiLoadComplete) {
            this.onApiLoadComplete();
          }
          reject(e);
        };
        
        // Add both scripts to document
        document.body.appendChild(script);
        document.body.appendChild(gsiScript);
      });
    }
  }
  
  /**
   * Ensures Google API is loaded before proceeding
   */
  public async ensureGoogleApiLoaded(): Promise<boolean> {
    if (this.isApiLoaded) return true;
    
    if (this.apiLoadPromise) {
      try {
        return await this.apiLoadPromise;
      } catch (e) {
        return false;
      }
    }
    
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
        console.log('MCP: Google API client loaded successfully');
      },
      onerror: (e: any) => {
        console.error('MCP: Failed to load Google API client:', e);
      },
      timeout: 10000, // 10 seconds
    });
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
