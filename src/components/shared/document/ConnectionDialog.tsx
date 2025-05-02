
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Info, AlertCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import ConnectionForm from './ConnectionForm';

interface ConnectionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  setClientId: (id: string) => void;
  apiKey: string;
  setApiKey: (key: string) => void;
  handleConnect: () => Promise<boolean>;
  isProcessing: boolean;
  connectionError: string | null;
  handleRetryConnection: () => void;
}

const ConnectionDialog: React.FC<ConnectionDialogProps> = ({
  isOpen,
  onOpenChange,
  clientId,
  setClientId,
  apiKey,
  setApiKey,
  handleConnect,
  isProcessing,
  connectionError,
  handleRetryConnection
}) => {
  return (
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>Select a document from Google Drive</DialogTitle>
        <DialogDescription>
          Connect to Google Drive to access your documents
        </DialogDescription>
      </DialogHeader>
      
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription className="mt-2">
          To connect to your Google Drive, you'll need to create Google API credentials:
          <ol className="list-decimal pl-5 mt-2 space-y-1 text-sm">
            <li>Go to <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">Google Cloud Console</a></li>
            <li>Create a project and enable the Google Drive API</li>
            <li>Create an OAuth client ID (Web application type)</li>
            <li>Add authorized redirect URIs: {window.location.origin}</li>
            <li>Create an API Key</li>
            <li>Enter these credentials below</li>
          </ol>
        </AlertDescription>
      </Alert>
      
      {connectionError && (
        <Alert variant="destructive" className="mt-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="mt-2">
            {connectionError}
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2 w-full" 
              onClick={handleRetryConnection}
            >
              Try again
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      <Separator className="my-2" />
      <ConnectionForm 
        clientId={clientId}
        setClientId={setClientId}
        apiKey={apiKey}
        setApiKey={setApiKey}
        handleConnect={handleConnect}
        isLoading={isProcessing}
      />
    </DialogContent>
  );
};

export default ConnectionDialog;
