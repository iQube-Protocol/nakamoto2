import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook for listening to document context events
 */
export function useDocumentEvents(callback: () => void) {
  // Keep track of the callback with a ref
  const callbackRef = useRef(callback);
  
  // Update ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);
  
  // Set up event listener for document context updates
  useEffect(() => {
    const handleDocumentUpdate = (event: CustomEvent) => {
      console.log('Document context updated event received:', event.detail);
      callbackRef.current();
    };
    
    // Add event listener with type assertion
    window.addEventListener('documentContextUpdated', handleDocumentUpdate as EventListener);
    
    return () => {
      // Remove event listener with type assertion
      window.removeEventListener('documentContextUpdated', handleDocumentUpdate as EventListener);
    };
  }, []);
}

/**
 * Hook for handling document updates from parent components
 */
export function useDocumentUpdates(documentUpdates: number, callback: () => void) {
  // Keep track of the callback with a ref
  const callbackRef = useRef(callback);
  const prevUpdatesRef = useRef(documentUpdates);
  
  // Update ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);
  
  // Handle documentUpdates prop changes
  useEffect(() => {
    if (documentUpdates > 0 && documentUpdates !== prevUpdatesRef.current) {
      console.log(`Document updates trigger detected: ${prevUpdatesRef.current} -> ${documentUpdates}`);
      callbackRef.current();
      prevUpdatesRef.current = documentUpdates;
    }
  }, [documentUpdates]);
}
