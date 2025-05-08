
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function useDocumentContextUpdates() {
  const [documentContextUpdated, setDocumentContextUpdated] = useState<number>(0);
  const navigate = useNavigate();

  const handleDocumentContextUpdated = () => {
    setDocumentContextUpdated(prev => prev + 1);
    console.log('Document context updated, triggering refresh');
  };

  return {
    documentContextUpdated,
    handleDocumentContextUpdated
  };
}
