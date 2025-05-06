
import { GoogleApiLoaderOptions } from './api/types';
import { ScriptLoader } from './api/scriptLoader';
import { ApiInitializer } from './api/apiInitializer';

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
  
  constructor(options: GoogleApiLoaderOptions = {}) {
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
        
        // Load GAPI script
        ScriptLoader.loadScript({
          src: 'https://apis.google.com/js/api.js',
          async: true,
          onLoad: () => {
            this.scriptLoadAttempts = 0; // Reset attempts counter on success
            this.onGapiLoaded();
            gapiLoaded = true;
            checkAllLoaded();
          },
          onError: (e) => {
            console.error('Failed to load Google API script:', e);
            reject(e);
          }
        }, this.maxLoadAttempts).catch(reject);
        
        // Load GSI script
        ScriptLoader.loadScript({
          src: 'https://accounts.google.com/gsi/client',
          async: true,
          onLoad: () => {
            gsiLoaded = true;
            checkAllLoaded();
          },
          onError: (e) => {
            console.error('Failed to load Google Sign-In script:', e);
            reject(e);
          }
        }, 2).catch(reject); // Only retry once for GSI
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
          const success = await ApiInitializer.initializeGapiClient(this.gapi);
          if (success) {
            this.apiInitialized = true;
            this.isApiLoaded = true;
          }
          return success;
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
    
    ApiInitializer.initializeGapiClient(this.gapi).then((success) => {
      this.isApiLoaded = success;
      this.apiInitialized = success;
      
      if (!success) {
        // Retry once
        ApiInitializer.retryInitialization(this.gapi).then((retrySuccess) => {
          this.isApiLoaded = retrySuccess;
          this.apiInitialized = retrySuccess;
        });
      }
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
