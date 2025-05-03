
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { useDocumentSelectorContext } from './DocumentSelectorContext';

const ApiLoadingAlert: React.FC = () => {
  const { apiCheckAttempts } = useDocumentSelectorContext();
  
  return (
    <Alert className="bg-blue-500/10 border-blue-500/30">
      <Info className="h-4 w-4 text-blue-500" />
      <AlertDescription className="mt-2">
        Loading Google API... Please wait.
        {apiCheckAttempts > 10 && (
          <p className="text-sm mt-1">
            This is taking longer than expected. You may need to refresh the page if it doesn't complete soon.
          </p>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default ApiLoadingAlert;
