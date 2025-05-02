
import { ScriptLoadOptions } from './types';

/**
 * Helper utility for loading scripts dynamically
 */
export class ScriptLoader {
  /**
   * Load a script with retry logic
   */
  public static loadScript(options: ScriptLoadOptions, maxRetries = 3): Promise<boolean> {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      
      const attemptLoad = () => {
        attempts++;
        
        const script = document.createElement('script');
        script.src = options.src;
        script.async = options.async !== false;
        
        script.onload = () => {
          if (options.onLoad) {
            options.onLoad();
          }
          resolve(true);
        };
        
        script.onerror = (e: Event) => {
          if (options.onError) {
            options.onError(e);
          }
          
          if (attempts < maxRetries) {
            console.log(`Script load failed, retrying (${attempts}/${maxRetries})...`);
            // Remove failed script
            script.remove();
            // Retry after a short delay
            setTimeout(attemptLoad, 1000);
          } else {
            console.error(`Failed to load script after ${maxRetries} attempts:`, options.src);
            reject(new Error(`Failed to load script: ${options.src}`));
          }
        };
        
        document.body.appendChild(script);
      };
      
      attemptLoad();
    });
  }
}
