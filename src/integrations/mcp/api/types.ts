
/**
 * Types for Google API Loader
 */

/**
 * Callbacks for API loading events
 */
export interface ApiLoadCallbacks {
  onApiLoadStart?: () => void;
  onApiLoadComplete?: () => void;
}

/**
 * Script loading options
 */
export interface ScriptLoadOptions {
  async?: boolean;
  defer?: boolean;
  timeout?: number;
}

/**
 * API loader state
 */
export interface ApiLoaderState {
  isApiLoaded: boolean;
  loadAttempts: number;
  maxLoadAttempts: number;
  apiLoadPromise: Promise<boolean> | null;
}
