
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import ConnectionForm from './ConnectionForm';
import { useDocumentSelectorContext } from './DocumentSelectorContext';
import { useDriveConnection } from '@/hooks/useDriveConnection';

const ConnectionInstructions: React.FC = () => {
  const { 
    apiLoadingState, 
    handleResetConnection, 
    handleConnectClick, 
    isProcessing 
  } = useDocumentSelectorContext();
  
  const { 
    connectionAttempts,
    clientId,
    setClientId,
    apiKey,
    setApiKey
  } = useDriveConnection();
  
  return (
    <>
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription className="mt-2">
          To connect to your Google Drive, you'll need to create Google API credentials:
          <ol className="list-decimal pl-5 mt-2 space-y-1 text-sm">
            <li>Go to <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">Google Cloud Console</a></li>
            <li>Create a project and enable the Google Drive API</li>
            <li>Create an OAuth client ID (Web application type)</li>
            <li>Create an API Key</li>
            <li>Enter these credentials below</li>
          </ol>
        </AlertDescription>
      </Alert>
      
      <Separator className="my-2" />
      
      <ConnectionForm 
        clientId={clientId}
        setClientId={setClientId}
        apiKey={apiKey}
        setApiKey={setApiKey}
        handleConnect={handleConnectClick}
        isLoading={isProcessing}
        disabled={apiLoadingState !== 'loaded'}
        isApiLoading={apiLoadingState === 'loading'}
      />
      
      {connectionAttempts > 0 && apiLoadingState !== 'loaded' && (
        <Alert className="bg-yellow-500/10 border-yellow-500/30 mt-2">
          <Info className="h-4 w-4 text-yellow-500" />
          <AlertDescription className="mt-2">
            If you're having trouble connecting, try refreshing the page and trying again.
            Make sure to allow pop-ups for this site, as Google's authentication may appear in a popup window.
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
      )}
    </>
  );
};

export default ConnectionInstructions;
