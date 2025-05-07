
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDocumentSelectorContext } from './DocumentSelectorContext';

const ApiErrorAlert: React.FC = () => {
  const { handleResetConnection } = useDocumentSelectorContext();
  
  return (
    <Alert className="bg-red-500/10 border-red-500/30">
      <AlertTriangle className="h-4 w-4 text-red-500" />
      <AlertDescription className="mt-2">
        Failed to load Google API after several attempts. Please try:
        <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
          <li>Refreshing the page</li>
          <li>Checking your internet connection</li>
          <li>Disabling any ad blockers or privacy extensions</li>
          <li>Using a different browser</li>
        </ul>
        <div className="mt-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleResetConnection}
            className="flex items-center gap-2 mt-2 bg-purple-500 hover:bg-purple-600 text-white"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Reset Connection
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default ApiErrorAlert;
