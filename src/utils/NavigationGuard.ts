/**
 * NavigationGuard - Centralized navigation state management
 * Prevents persona operations during React navigation transitions
 * to avoid TypeScript compilation cascade failures
 */
class NavigationGuard {
  private static isNavigating = false;
  private static navigationTimeout: NodeJS.Timeout | null = null;
  private static initialized = false;
  private static originalPushState: typeof window.history.pushState;
  private static originalReplaceState: typeof window.history.replaceState;

  /**
   * Initialize the NavigationGuard (call once at app startup)
   */
  static init() {
    if (this.initialized || typeof window === 'undefined') return;
    
    // Store original methods
    this.originalPushState = window.history.pushState;
    this.originalReplaceState = window.history.replaceState;
    
    // Override history methods ONCE globally
    window.history.pushState = (...args) => {
      this.handleNavigationStart();
      return this.originalPushState.apply(window.history, args);
    };
    
    window.history.replaceState = (...args) => {
      this.handleNavigationStart();
      return this.originalReplaceState.apply(window.history, args);
    };
    
    // Listen for browser navigation
    window.addEventListener('beforeunload', this.handleNavigationStart);
    window.addEventListener('popstate', this.handleNavigationStart);
    
    this.initialized = true;
  }

  /**
   * Handle navigation start - set protection flags with page-specific timeouts
   */
  private static handleNavigationStart = () => {
    this.isNavigating = true;
    
    if (this.navigationTimeout) {
      clearTimeout(this.navigationTimeout);
    }
    
    // Page-specific timeout configuration for enhanced navigation safety
    const currentPath = window.location.pathname;
    let timeout = 150; // Default timeout
    
    if (currentPath.includes('/profile')) {
      timeout = 400; // Extended for message content rendering
    } else if (currentPath.includes('/learn') || currentPath.includes('/earn') || 
               currentPath.includes('/connect') || currentPath.includes('/mondai')) {
      timeout = 500; // Extended for agent interface complexity
    } else if (currentPath.includes('/settings')) {
      timeout = 300; // Extended for persona hooks
    }
    
    console.log(`NavigationGuard: Starting navigation protection for ${timeout}ms on ${currentPath}`);
    
    this.navigationTimeout = setTimeout(() => {
      this.isNavigating = false;
      console.log('NavigationGuard: Navigation protection ended');
    }, timeout);
  };

  /**
   * Check if navigation is currently in progress
   */
  static isNavigationInProgress(): boolean {
    // Emergency disable flag
    if ((window as any).__disableNavigationGuard) {
      return false;
    }
    return this.isNavigating;
  }

  /**
   * Prevent operation during navigation, return null if blocked
   */
  static preventDuringNavigation<T>(operation: () => T): T | null {
    if (this.isNavigationInProgress()) {
      return null;
    }
    return operation();
  }

  /**
   * Cleanup method (for testing or emergency rollback)
   */
  static cleanup() {
    if (!this.initialized) return;
    
    // Restore original methods
    if (this.originalPushState) {
      window.history.pushState = this.originalPushState;
    }
    if (this.originalReplaceState) {
      window.history.replaceState = this.originalReplaceState;
    }
    
    // Remove event listeners
    window.removeEventListener('beforeunload', this.handleNavigationStart);
    window.removeEventListener('popstate', this.handleNavigationStart);
    
    // Clear timeout
    if (this.navigationTimeout) {
      clearTimeout(this.navigationTimeout);
    }
    
    this.initialized = false;
    this.isNavigating = false;
  }
}

export default NavigationGuard;