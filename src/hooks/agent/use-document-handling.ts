
import { toast } from 'sonner';

export const useDocumentHandling = () => {
  const handleDocumentAdded = (onDocumentAdded?: () => void) => {
    // Refresh the messages or notify the user
    toast.success('Document context has been updated');
    
    // Call the parent's onDocumentAdded if provided
    if (onDocumentAdded) {
      onDocumentAdded();
    }
  };
  
  return { handleDocumentAdded };
};
