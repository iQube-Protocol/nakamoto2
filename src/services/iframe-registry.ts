/**
 * Global iframe registry for preserving iframe state across route navigation
 */
class IframeRegistry {
  private static instance: IframeRegistry;
  private iframes: Map<string, HTMLIFrameElement> = new Map();
  private containers: Map<string, HTMLDivElement> = new Map();
  
  private constructor() {}

  static getInstance(): IframeRegistry {
    if (!IframeRegistry.instance) {
      IframeRegistry.instance = new IframeRegistry();
    }
    return IframeRegistry.instance;
  }

  /**
   * Store an iframe for preservation across route changes
   */
  preserveIframe(id: string, iframe: HTMLIFrameElement): void {
    console.log(`IframeRegistry: Preserving iframe ${id}`);
    
    // Remove from current parent to prevent destruction
    if (iframe.parentNode) {
      iframe.parentNode.removeChild(iframe);
    }
    
    // Store the iframe
    this.iframes.set(id, iframe);
  }

  /**
   * Restore a preserved iframe to a new container
   */
  restoreIframe(id: string, container: HTMLDivElement): HTMLIFrameElement | null {
    const iframe = this.iframes.get(id);
    if (iframe && container) {
      console.log(`IframeRegistry: Restoring iframe ${id}`);
      container.appendChild(iframe);
      this.containers.set(id, container);
      return iframe;
    }
    return null;
  }

  /**
   * Check if an iframe is preserved
   */
  hasIframe(id: string): boolean {
    return this.iframes.has(id);
  }

  /**
   * Get a preserved iframe without restoring it
   */
  getIframe(id: string): HTMLIFrameElement | null {
    return this.iframes.get(id) || null;
  }

  /**
   * Remove an iframe from the registry
   */
  removeIframe(id: string): void {
    console.log(`IframeRegistry: Removing iframe ${id}`);
    this.iframes.delete(id);
    this.containers.delete(id);
  }

  /**
   * Clear all preserved iframes
   */
  clearAll(): void {
    console.log('IframeRegistry: Clearing all preserved iframes');
    this.iframes.clear();
    this.containers.clear();
  }
}

export const iframeRegistry = IframeRegistry.getInstance();