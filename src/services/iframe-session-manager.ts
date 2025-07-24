
/**
 * Global iframe session manager for maintaining iframe state across route navigation
 */
class IframeSessionManager {
  private static instance: IframeSessionManager;
  private mediaInitialized: boolean = false;
  private authState: any = null;
  private iframeRef: HTMLIFrameElement | null = null;
  private storageKey = 'qrypto-media-iframe-initialized';
  private authStorageKey = 'qrypto-media-iframe-auth';
  private sessionRecoveryAttempts: number = 0;
  private maxRecoveryAttempts: number = 3;

  private constructor() {
    // Load initial state from localStorage
    this.loadFromStorage();
    this.setupMessageListener();
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
      
      // Load auth state
      const authStored = localStorage.getItem(this.authStorageKey);
      if (authStored) {
        try {
          this.authState = JSON.parse(authStored);
          console.log('IframeSessionManager: Loaded auth state from storage');
        } catch (e) {
          console.warn('IframeSessionManager: Failed to parse stored auth state');
          localStorage.removeItem(this.authStorageKey);
        }
      }
    }
  }

  private saveToStorage(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.storageKey, this.mediaInitialized.toString());
      
      // Save auth state
      if (this.authState) {
        localStorage.setItem(this.authStorageKey, JSON.stringify(this.authState));
      }
    }
  }

  private setupMessageListener(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('message', (event) => {
        // Only accept messages from the sizzleperks domain
        if (event.origin !== 'https://www.sizzleperks.com') {
          return;
        }

        const { type, data } = event.data;
        
        switch (type) {
          case 'AUTH_STATE_CHANGED':
            this.handleAuthStateChange(data);
            break;
          case 'AUTH_REQUIRED':
            this.handleAuthRequired();
            break;
          case 'SESSION_READY':
            this.handleSessionReady();
            break;
        }
      });
    }
  }

  private handleAuthStateChange(authData: any): void {
    console.log('IframeSessionManager: Auth state changed', authData);
    this.authState = authData;
    this.saveToStorage();
    this.sessionRecoveryAttempts = 0; // Reset recovery attempts on successful auth
  }

  private handleAuthRequired(): void {
    console.log('IframeSessionManager: Auth required, attempting recovery');
    this.attemptSessionRecovery();
  }

  private handleSessionReady(): void {
    console.log('IframeSessionManager: Session ready');
    // Iframe is fully loaded and ready
  }

  private attemptSessionRecovery(): void {
    if (this.sessionRecoveryAttempts >= this.maxRecoveryAttempts) {
      console.warn('IframeSessionManager: Max recovery attempts reached');
      return;
    }

    if (this.authState && this.iframeRef) {
      console.log('IframeSessionManager: Attempting to restore auth state');
      this.sessionRecoveryAttempts++;
      
      // Send auth state to iframe
      this.iframeRef.contentWindow?.postMessage({
        type: 'RESTORE_AUTH_STATE',
        data: this.authState
      }, 'https://www.sizzleperks.com');
    }
  }

  isMediaInitialized(): boolean {
    return this.mediaInitialized;
  }

  setMediaInitialized(initialized: boolean): void {
    this.mediaInitialized = initialized;
    this.saveToStorage();
  }

  setIframeRef(iframe: HTMLIFrameElement | null): void {
    this.iframeRef = iframe;
    
    // Attempt to restore session when iframe is set
    if (iframe && this.authState) {
      setTimeout(() => {
        this.attemptSessionRecovery();
      }, 1000); // Small delay to ensure iframe is fully loaded
    }
  }

  getAuthState(): any {
    return this.authState;
  }

  hasAuthState(): boolean {
    return this.authState !== null;
  }

  requestAuthState(): void {
    if (this.iframeRef) {
      this.iframeRef.contentWindow?.postMessage({
        type: 'REQUEST_AUTH_STATE'
      }, 'https://www.sizzleperks.com');
    }
  }

  clearSession(): void {
    this.mediaInitialized = false;
    this.authState = null;
    this.sessionRecoveryAttempts = 0;
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.storageKey);
      localStorage.removeItem(this.authStorageKey);
    }
    
    console.log('IframeSessionManager: Session cleared');
  }
}

export const iframeSessionManager = IframeSessionManager.getInstance();
