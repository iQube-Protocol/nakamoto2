
import { useState } from 'react';

export const useDocumentContext = () => {
  const [documentContextUpdated, setDocumentContextUpdated] = useState<number>(0);

  // Make the function consistent with how it's called throughout the app
  const handleDocumentContextUpdated = () => {
    setDocumentContextUpdated(prev => prev + 1);
    console.log('Document context updated, triggering refresh');
  };

  return {
    documentContextUpdated,
    setDocumentContextUpdated: handleDocumentContextUpdated
  };
};
