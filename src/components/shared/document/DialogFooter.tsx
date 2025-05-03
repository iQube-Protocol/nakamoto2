
import React from 'react';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { RefreshCw } from 'lucide-react';
import { useDocumentSelectorContext } from './DocumentSelectorContext';

const DocumentDialogFooter: React.FC = () => {
  const { 
    driveConnected, 
    handleResetConnection, 
    setIsOpen, 
    handleRefreshDocuments, 
    isProcessing 
  } = useDocumentSelectorContext();
  
  if (!driveConnected) return null;
  
  const handleResetClick = () => {
    // Call the reset handler and close the dialog
    handleResetConnection();
    setIsOpen(false);
    
    // Optional: Reload the page after a short delay (helps with complete reset)
    if (process.env.NODE_ENV !== 'production') {
      setTimeout(() => window.location.reload(), 1500);
    }
  };
  
  return (
    <DialogFooter>
      <Button 
        variant="outline" 
        size="sm"
        onClick={handleResetClick} 
        className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white" 
      >
        <RefreshCw className="h-3.5 w-3.5" />
        Reset Connection
      </Button>
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
        <Button 
          onClick={handleRefreshDocuments} 
          disabled={isProcessing} 
          className="gap-1 bg-purple-500 hover:bg-purple-600 text-white"
        >
          {isProcessing && <RefreshCw className="h-4 w-4 animate-spin" />}
          {!isProcessing && <RefreshCw className="h-4 w-4" />}
          Refresh
        </Button>
      </div>
    </DialogFooter>
  );
};

export default DocumentDialogFooter;
