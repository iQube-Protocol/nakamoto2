
/**
 * Types for API-related functionality
 */

export interface ApiLoadCallbacks {
  onApiLoadStart?: (() => void) | null;
  onApiLoadComplete?: (() => void) | null;
}
