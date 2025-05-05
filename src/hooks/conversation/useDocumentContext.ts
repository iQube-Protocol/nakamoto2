
import { useState } from 'react';

export const useDocumentContext = () => {
  const [documentContextUpdated, setDocumentContextUpdated] = useState<number>(0);

  return {
    documentContextUpdated,
    setDocumentContextUpdated: () => {
      setDocumentContextUpdated(prev => prev + 1);
      console.log('Document context updated, triggering refresh');
    }
  };
};
