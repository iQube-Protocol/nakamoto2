
/**
 * Utility class for loading scripts dynamically
 */
export class ScriptLoader {
  /**
   * Load a script asynchronously
   */
  static loadScript(url: string, options: {
    async?: boolean;
    defer?: boolean;
    timeout?: number;
  }): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if script already exists
      const existingScript = document.querySelector(`script[src="${url}"]`);
      if (existingScript) {
        return resolve();
      }
      
      // Create script element
      const script = document.createElement('script');
      script.src = url;
      script.type = 'text/javascript';
      
      if (options.async) script.async = true;
      if (options.defer) script.defer = true;
      
      // Set up timeout
      const timeoutId = options.timeout 
        ? setTimeout(() => reject(new Error(`Script load timed out for ${url}`)), options.timeout)
        : null;
      
      // Event handlers
      script.onload = () => {
        if (timeoutId) clearTimeout(timeoutId);
        resolve();
      };
      
      script.onerror = () => {
        if (timeoutId) clearTimeout(timeoutId);
        document.body.removeChild(script);
        reject(new Error(`Error loading script: ${url}`));
      };
      
      // Add to document
      document.body.appendChild(script);
    });
  }
  
  /**
   * Remove Google API scripts from the DOM
   */
  static removeGoogleApiScripts(): void {
    const scripts = document.querySelectorAll('script[src*="apis.google.com"], script[src*="accounts.google.com"]');
    scripts.forEach(script => {
      script.parentNode?.removeChild(script);
    });
  }
  
  /**
   * Reset Google API globals
   */
  static resetGoogleApiGlobals(): void {
    if (typeof window !== 'undefined') {
      // Clear the gapi property
      if ((window as any).gapi) {
        (window as any).gapi = undefined;
      }
      
      // Clear google accounts
      if ((window as any).google?.accounts) {
        (window as any).google.accounts = undefined;
      }
    }
  }
}
