
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDocumentSelectorContext } from './DocumentSelectorContext';

const ConnectionErrorAlert: React.FC = () => {
  const { handleResetConnection, driveConnected, connectionError } = useDocumentSelectorContext();
  
  if (!connectionError || !driveConnected) return null;
  
  return (
    <Alert className="bg-amber-500/10 border-amber-500/30 mb-4">
      <AlertTriangle className="h-4 w-4 text-amber-500" />
      <AlertDescription className="mt-2">
        There seems to be an issue with your Google Drive connection. This might happen if:
        <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
          <li>Your authentication token has expired</li>
          <li>You revoked access for this application</li>
          <li>There's a network connectivity issue</li>
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

export default ConnectionErrorAlert;
