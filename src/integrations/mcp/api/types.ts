
/**
 * Common types for Google API integration
 */

export interface GoogleApiLoaderOptions {
  onApiLoadStart?: () => void;
  onApiLoadComplete?: () => void;
}

export interface ScriptLoadOptions {
  src: string;
  async?: boolean;
  onLoad?: () => void;
  onError?: (e: Event) => void;
}
