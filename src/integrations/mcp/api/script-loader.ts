
import { toast } from 'sonner';
import { ScriptLoadOptions } from './types';

/**
 * Utility functions for loading external scripts
 */
export class ScriptLoader {
  /**
   * Load a script with proper error handling and timeouts
   */
  static loadScript(
    src: string, 
    options: ScriptLoadOptions = {}
  ): Promise<HTMLScriptElement> {
    return new Promise((resolve, reject) => {
      // Check if script already exists
      const existingScript = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement;
      if (existingScript) {
        console.log(`Script already loaded: ${src}`);
        resolve(existingScript);
        return;
      }
      
      // Create new script element
      const script = document.createElement('script');
      script.src = src;
      script.async = options.async ?? true;
      script.defer = options.defer ?? true;
      
      // Set up timeout
      const timeoutId = options.timeout 
        ? setTimeout(() => {
            reject(new Error(`Script load timeout: ${src}`));
          }, options.timeout)
        : null;
      
      // Set up event handlers
      script.onload = () => {
        console.log(`Script loaded successfully: ${src}`);
        if (timeoutId) clearTimeout(timeoutId);
        resolve(script);
      };
      
      script.onerror = (event) => {
        console.error(`Failed to load script: ${src}`, event);
        if (timeoutId) clearTimeout(timeoutId);
        reject(new Error(`Failed to load script: ${src}`));
      };
      
      // Add to document
      document.body.appendChild(script);
    });
  }
  
  /**
   * Remove script from document
   */
  static removeScript(src: string): void {
    const script = document.querySelector(`script[src="${src}"]`);
    if (script) {
      script.remove();
      console.log(`Removed script: ${src}`);
    }
  }
  
  /**
   * Clean up Google API scripts from the document
   */
  static removeGoogleApiScripts(): void {
    const scripts = document.querySelectorAll('script[src*="apis.google.com"], script[src*="accounts.google.com"]');
    scripts.forEach(script => {
      script.remove();
    });
    console.log(`Removed ${scripts.length} Google API scripts`);
  }
  
  /**
   * Reset global Google API objects
   */
  static resetGoogleApiGlobals(): void {
    // Reset gapi
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
    
    // Reset google accounts
    if ((window as any).google?.accounts) {
      try {
        (window as any).google.accounts = undefined;
      } catch (e) {
        console.warn('Error cleaning up Google accounts:', e);
      }
    }
    
    console.log('Reset Google API globals');
  }
}
