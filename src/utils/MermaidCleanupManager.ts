/**
 * MermaidCleanupManager - Global Mermaid state management
 * Prevents state contamination during React re-renders
 */
class MermaidCleanupManager {
  private static activeRenders = new Map<string, any>();
  private static renderQueue: Array<{ id: string; render: () => Promise<void> }> = [];
  private static isProcessing = false;
  private static initialized = false;

  /**
   * Initialize the cleanup manager
   */
  static init() {
    if (this.initialized) return;
    
    // Add global cleanup before page unload
    window.addEventListener('beforeunload', this.cleanupAll);
    
    this.initialized = true;
    console.log('MermaidCleanupManager: Initialized');
  }

  /**
   * Register a new Mermaid render and cleanup any previous renders for this ID
   */
  static registerRender(id: string, renderFunction: () => Promise<void>): Promise<void> {
    return new Promise((resolve, reject) => {
      // Force cleanup of any existing render with this ID
      this.forceCleanupRender(id);
      
      // Add to queue
      this.renderQueue.push({ 
        id, 
        render: async () => {
          try {
            this.activeRenders.set(id, { timestamp: Date.now(), status: 'rendering' });
            await renderFunction();
            this.activeRenders.set(id, { timestamp: Date.now(), status: 'complete' });
            resolve();
          } catch (error) {
            this.activeRenders.delete(id);
            reject(error);
          }
        }
      });
      
      this.processQueue();
    });
  }

  /**
   * Process the render queue sequentially to prevent conflicts
   */
  private static async processQueue() {
    if (this.isProcessing || this.renderQueue.length === 0) return;
    
    this.isProcessing = true;
    
    while (this.renderQueue.length > 0) {
      const nextRender = this.renderQueue.shift();
      if (nextRender) {
        try {
          await nextRender.render();
          await this.delay(50); // Small delay between renders
        } catch (error) {
          console.error(`MermaidCleanupManager: Render failed for ${nextRender.id}:`, error);
        }
      }
    }
    
    this.isProcessing = false;
  }

  /**
   * Force cleanup of a specific render
   */
  static forceCleanupRender(id: string) {
    const activeRender = this.activeRenders.get(id);
    if (activeRender) {
      console.log(`MermaidCleanupManager: Force cleaning up render ${id}`);
      
      // Remove data-processed attributes that cause conflicts
      this.removeDataProcessedAttributes(id);
      
      // Clear from active renders
      this.activeRenders.delete(id);
    }
  }

  /**
   * Remove data-processed attributes that cause Mermaid conflicts
   */
  static removeDataProcessedAttributes(containerId?: string) {
    const selector = containerId 
      ? `#${containerId} [data-processed], [id*="${containerId}"] [data-processed]`
      : '[data-processed]';
    
    const processedElements = document.querySelectorAll(selector);
    processedElements.forEach(element => {
      element.removeAttribute('data-processed');
    });
    
    // Also remove any Mermaid-generated IDs that might conflict
    const mermaidElements = document.querySelectorAll('[id^="mermaid-"]');
    mermaidElements.forEach(element => {
      if (containerId && !element.id.includes(containerId)) {
        element.remove();
      }
    });
  }

  /**
   * Emergency cleanup of all active renders
   */
  static cleanupAll = () => {
    console.log('MermaidCleanupManager: Emergency cleanup of all renders');
    
    // Remove all data-processed attributes
    this.removeDataProcessedAttributes();
    
    // Clear active renders
    this.activeRenders.clear();
    
    // Clear render queue
    this.renderQueue.length = 0;
    this.isProcessing = false;
  };

  /**
   * Get statistics for debugging
   */
  static getStats() {
    return {
      activeRenders: this.activeRenders.size,
      queueLength: this.renderQueue.length,
      isProcessing: this.isProcessing,
      renderDetails: Array.from(this.activeRenders.entries())
    };
  }

  /**
   * Simple delay utility
   */
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Cleanup method for testing or emergency rollback
   */
  static cleanup() {
    window.removeEventListener('beforeunload', this.cleanupAll);
    this.cleanupAll();
    this.initialized = false;
  }
}

export default MermaidCleanupManager;