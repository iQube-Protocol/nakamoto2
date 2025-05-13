
import { useEffect, useCallback } from 'react';

/**
 * Hook to handle document context event listeners
 */
export function useDocumentEvents(loadDocumentContext: () => Promise<void>) {
  // Set up event listeners for context changes
  useEffect(() => {
    const handleContextUpdate = (event: Event) => {
      console.log("Document context updated event received:", (event as CustomEvent).detail);
      loadDocumentContext();
    };
    
    // TypeScript type assertion for custom event
    window.addEventListener('documentContextUpdated', handleContextUpdate as EventListener);
    
    // Also reload when tab becomes visible
    const handleTabVisibilityChange = () => {
      if (!document.hidden) {
        console.log("Document became visible, reloading document context");
        loadDocumentContext();
      }
    };
    
    document.addEventListener('visibilitychange', handleTabVisibilityChange);
    
    // Clean up listeners
    return () => {
      window.removeEventListener('documentContextUpdated', handleContextUpdate as EventListener);
      document.removeEventListener('visibilitychange', handleTabVisibilityChange);
    };
  }, [loadDocumentContext]);
}

/**
 * Hook to handle document updates from parent components
 */
export function useDocumentUpdates(documentUpdates: number = 0, loadDocumentContext: () => Promise<void>) {
  // Reload document context when documentUpdates changes
  useEffect(() => {
    if (documentUpdates > 0) {
      console.log(`DocumentContext received update signal (${documentUpdates}), reloading documents`);
      loadDocumentContext();
    }
  }, [documentUpdates, loadDocumentContext]);
}
