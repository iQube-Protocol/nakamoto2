
import { GoogleApiLoaderOptions } from './api/types';
import { ScriptLoader } from './api/scriptLoader';
import { ApiInitializer } from './api/apiInitializer';
import { GoogleApiEvents } from './api/GoogleApiEvents';
import { GoogleApiState } from './api/GoogleApiState';
import { GoogleApiClient } from './api/GoogleApiClient';

/**
 * Helper for loading and managing Google API scripts
 */
export class GoogleApiLoader {
  private client: GoogleApiClient;
  private state: GoogleApiState;
  private events: GoogleApiEvents;
  
  constructor(options: GoogleApiLoaderOptions = {}) {
    this.client = new GoogleApiClient();
    this.state = new GoogleApiState();
    this.events = new GoogleApiEvents(options.onApiLoadStart, options.onApiLoadComplete);
  }
  
  /**
   * Load Google API script dynamically with improved error handling and retry logic
   */
  public loadGoogleApi(): void {
    if (typeof window !== 'undefined' && !this.state.isLoaded() && !this.state.getApiLoadPromise()) {
      console.log('MCP: Loading Google API scripts...');
      
      this.events.triggerLoadStart();
      
      // Set a global timeout to prevent hanging
      this.state.setLoadTimeout(setTimeout(() => {
        console.error('MCP: Google API scripts loading timed out');
        this.reset();
        this.events.triggerLoadComplete();
      }, 15000)); // 15 second overall timeout
      
      // Create a promise that resolves when both scripts are loaded
      this.state.setApiLoadPromise(new Promise<boolean>((resolve, reject) => {
        let gapiLoaded = false;
        let gsiLoaded = false;
        
        const checkAllLoaded = () => {
          if (gapiLoaded && gsiLoaded) {
            this.state.clearLoadTimeout();
            this.events.triggerLoadComplete();
            resolve(true);
          }
        };
        
        // Load GAPI script
        ScriptLoader.loadScript({
          src: 'https://apis.google.com/js/api.js',
          async: true,
          onLoad: () => {
            this.state.resetLoadAttempts();
            this.onGapiLoaded();
            gapiLoaded = true;
            checkAllLoaded();
          },
          onError: (e) => {
            console.error('Failed to load Google API script:', e);
            reject(e);
          }
        }, this.state.getMaxLoadAttempts()).catch(reject);
        
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
      }).catch((error) => {
        console.error('MCP: Error loading Google API scripts:', error);
        this.reset();
        return false; // Explicitly return a boolean value here
      }));
    }
  }
  
  /**
   * Ensures Google API is loaded and initialized before proceeding
   */
  public async ensureGoogleApiLoaded(): Promise<boolean> {
    // If API is already fully loaded and initialized
    if (this.state.isLoaded() && this.state.isInitialized()) return true;
    
    // If we're in the process of loading, wait for it
    if (this.state.getApiLoadPromise()) {
      try {
        // Explicitly cast the result to boolean to ensure type safety
        const loadResult: boolean = await this.state.getApiLoadPromise()!;
        
        // After scripts are loaded, ensure client is initialized
        if (!this.state.isInitialized()) {
          this.client.setGapi((window as any).gapi);
          
          // Check if gapi is available now
          if (!this.client.getGapi()) {
            console.error('MCP: Google API client not available after loading');
            return false;
          }
          
          // Initialize client
          const success = await ApiInitializer.initializeGapiClient(this.client.getGapi());
          if (success) {
            this.state.setInitialized(true);
            this.state.setLoaded(true);
          }
          return success;
        }
        
        return loadResult;
      } catch (e) {
        console.error('Error ensuring Google API loaded:', e);
        // If promise failed, reset it so we can try loading again
        this.state.setApiLoadPromise(null);
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
    this.client.setGapi((window as any).gapi);
    if (!this.client.getGapi()) {
      console.error('MCP: Google API client failed to load');
      return;
    }
    
    // Initialize gapi client with a timeout to prevent hanging
    const initPromise = ApiInitializer.initializeGapiClient(this.client.getGapi());
    
    // Add a timeout for initialization
    const timeoutPromise = new Promise<boolean>((resolve) => {
      setTimeout(() => {
        console.warn('MCP: Client initialization timed out, continuing...');
        resolve(false);
      }, 5000);
    });
    
    // Race the initialization against the timeout
    Promise.race([initPromise, timeoutPromise]).then((success) => {
      this.state.setLoaded(success);
      this.state.setInitialized(success);
      
      if (!success) {
        // Retry once
        ApiInitializer.retryInitialization(this.client.getGapi()).then((retrySuccess) => {
          this.state.setLoaded(retrySuccess);
          this.state.setInitialized(retrySuccess);
        });
      }
    });
  }
  
  /**
   * Check if API is fully initialized and ready for use
   */
  public isClientInitialized(): boolean {
    return this.state.isLoaded() && this.state.isInitialized() && 
           this.client.isClientInitialized();
  }
  
  /**
   * Reset API loader state
   */
  public reset(): void {
    this.state.reset();
    this.client.reset();
  }
  
  public getGapi(): any {
    return this.client.getGapi();
  }
  
  public setTokenClient(tokenClient: any): void {
    this.client.setTokenClient(tokenClient);
  }
  
  public getTokenClient(): any {
    return this.client.getTokenClient();
  }
  
  public isLoaded(): boolean {
    return this.state.isLoaded();
  }
}
