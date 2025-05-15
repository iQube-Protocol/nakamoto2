
import { useEffect } from 'react';

/**
 * Hook to listen for document context events
 */
export const useDocumentEvents = (onContextChange: () => void) => {
  // Set up event listeners for document context changes
  useEffect(() => {
    const handleContextChange = () => {
      console.log('Document context changed event received');
      onContextChange();
    };
    
    // Listen for document context change events
    window.addEventListener('document-context-changed', handleContextChange);
    window.addEventListener('document-added', handleContextChange);
    window.addEventListener('document-removed', handleContextChange);
    
    // Clean up
    return () => {
      window.removeEventListener('document-context-changed', handleContextChange);
      window.removeEventListener('document-added', handleContextChange);
      window.removeEventListener('document-removed', handleContextChange);
    };
  }, [onContextChange]);
};

/**
 * Hook to listen for document updates from external sources
 */
export const useDocumentUpdates = (documentUpdates: number, onUpdate: () => void) => {
  // Listen for document updates from parent component
  useEffect(() => {
    if (documentUpdates > 0) {
      console.log(`Document updates detected (${documentUpdates}), triggering refresh`);
      onUpdate();
    }
  }, [documentUpdates, onUpdate]);
};

/**
 * Dispatch a document context change event
 */
export const dispatchDocumentContextChanged = () => {
  const event = new CustomEvent('document-context-changed');
  window.dispatchEvent(event);
};

/**
 * Dispatch a document added event
 */
export const dispatchDocumentAdded = (documentId?: string) => {
  const event = new CustomEvent('document-added', { detail: { documentId } });
  window.dispatchEvent(event);
};

/**
 * Dispatch a document removed event
 */
export const dispatchDocumentRemoved = (documentId?: string) => {
  const event = new CustomEvent('document-removed', { detail: { documentId } });
  window.dispatchEvent(event);
};
