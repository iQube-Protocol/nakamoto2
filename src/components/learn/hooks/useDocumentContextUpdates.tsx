
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function useDocumentContextUpdates() {
  const [documentContextUpdated, setDocumentContextUpdated] = useState<number>(0);
  const navigate = useNavigate();

  // Listen for document context update events
  useEffect(() => {
    const handleDocumentContextUpdated = (event: Event) => {
      console.log('Document context update event received:', (event as CustomEvent).detail);
      setDocumentContextUpdated(prev => prev + 1);
    };

    // Listen for both document context updated and drive connection changes
    window.addEventListener('documentContextUpdated', handleDocumentContextUpdated as EventListener);
    window.addEventListener('driveConnectionChanged', handleDocumentContextUpdated as EventListener);
    
    // Also refresh when tab becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('Tab became visible, refreshing document context');
        setDocumentContextUpdated(prev => prev + 1);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('documentContextUpdated', handleDocumentContextUpdated as EventListener);
      window.removeEventListener('driveConnectionChanged', handleDocumentContextUpdated as EventListener);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const handleDocumentContextUpdated = () => {
    setDocumentContextUpdated(prev => prev + 1);
    console.log('Document context manually updated, triggering refresh');
  };

  return {
    documentContextUpdated,
    handleDocumentContextUpdated
  };
}
