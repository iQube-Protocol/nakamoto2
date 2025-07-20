
/**
 * Global iframe session manager for maintaining iframe state across route navigation
 */
class IframeSessionManager {
  private static instance: IframeSessionManager;
  private mediaInitialized: boolean = false;
  private storageKey = 'qrypto-media-iframe-initialized';

  private constructor() {
    // Load initial state from localStorage
    this.loadFromStorage();
  }

  static getInstance(): IframeSessionManager {
    if (!IframeSessionManager.instance) {
      IframeSessionManager.instance = new IframeSessionManager();
    }
    return IframeSessionManager.instance;
  }

  private loadFromStorage(): void {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(this.storageKey);
      this.mediaInitialized = stored === 'true';
    }
  }

  private saveToStorage(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.storageKey, this.mediaInitialized.toString());
    }
  }

  isMediaInitialized(): boolean {
    return this.mediaInitialized;
  }

  setMediaInitialized(initialized: boolean): void {
    this.mediaInitialized = initialized;
    this.saveToStorage();
  }

  clearSession(): void {
    this.mediaInitialized = false;
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.storageKey);
    }
  }
}

export const iframeSessionManager = IframeSessionManager.getInstance();
